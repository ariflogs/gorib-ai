import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '$lib/backend/convex/_generated/api';
import type { Id } from '$lib/backend/convex/_generated/dataModel';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getSessionCookie } from 'better-auth/cookies';
import { ConvexHttpClient } from 'convex/browser';
import { z } from 'zod/v4';

const reqBodySchema = z
	.object({
		message: z.string().optional(),
		model_id: z.string(),

		session_token: z.string(),
		conversation_id: z.string().optional(),
		web_search_enabled: z.boolean().optional(),
		images: z
			.array(
				z.object({
					url: z.string(),
					storage_id: z.string(),
					fileName: z.string().optional(),
				})
			)
			.optional(),
		reasoning_effort: z.enum(['low', 'medium', 'high']).optional(),
	})
	.refine(
		(data) => {
			if (data.conversation_id === undefined && data.message === undefined) return false;

			return true;
		},
		{
			message: 'You must provide a message when creating a new conversation',
		}
	);

export type GenerateMessageRequestBody = z.infer<typeof reqBodySchema>;

export type GenerateMessageResponse = {
	ok: true;
	conversation_id: string;
};

function response(res: GenerateMessageResponse) {
	return json(res);
}

const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);

export const POST: RequestHandler = async ({ request }) => {
	const startTime = Date.now();
	console.log('[GenerateMessage] Starting message generation request');

	// 1. Parse and validate request body
	const bodyResult = await request.json().catch(() => null);
	if (!bodyResult) {
		console.log('[GenerateMessage] Failed to parse request body');
		return error(400, 'Failed to parse request body');
	}

	const parsed = reqBodySchema.safeParse(bodyResult);
	if (!parsed.success) {
		console.log('[GenerateMessage] Schema validation failed:', parsed.error);
		return error(400, parsed.error);
	}
	const args = parsed.data;

	// 2. Get session token
	const cookie = getSessionCookie(request.headers);
	const sessionToken = cookie?.split('.')[0] ?? null;

	if (!sessionToken) {
		console.log('[GenerateMessage] No session token found');
		return error(401, 'Unauthorized');
	}

	try {
		// 3. Check rate limit before proceeding
		const rateLimitCheck = await client.query(api.rate_limiter.checkRateLimit, {
			session_token: sessionToken,
			modelId: args.model_id,
			modelType: 'chat',
		});

		if (!rateLimitCheck.allowed) {
			console.log('[GenerateMessage] Rate limit exceeded:', rateLimitCheck.reason);
			return error(429, rateLimitCheck.reason || 'Rate limit exceeded');
		}

		console.log('[GenerateMessage] Rate limit check passed');

		// 4. Create conversation/message if needed
		let conversationId = args.conversation_id;
		if (!conversationId) {
			// New conversation
			if (args.message === undefined) {
				return error(400, 'You must provide a message when creating a new conversation');
			}

			const result = await client.mutation(api.conversations.createAndAddMessage, {
				content: args.message,
				content_html: '',
				role: 'user',
				images: args.images,
				web_search_enabled: args.web_search_enabled,
				session_token: sessionToken,
			});

			conversationId = result.conversationId;
			console.log('[GenerateMessage] New conversation and message created:', conversationId);
		} else {
			// Existing conversation
			console.log('[GenerateMessage] Using existing conversation:', conversationId);

			if (args.message) {
				await client.mutation(api.messages.create, {
					conversation_id: conversationId as Id<'conversations'>,
					content: args.message,
					session_token: sessionToken,
					model_id: args.model_id,
					reasoning_effort: args.reasoning_effort,
					role: 'user',
					images: args.images,
					web_search_enabled: args.web_search_enabled,
				});

				console.log('[GenerateMessage] User message created');
			}
		}

		// 5. Set generating status to true before starting generation
		await client.mutation(api.conversations.updateGenerating, {
			conversation_id: conversationId as Id<'conversations'>,
			generating: true,
			session_token: sessionToken,
		});

		// 6. Call Convex action to generate AI response (AWAITED - runs on Convex)
		console.log('[GenerateMessage] Calling AI generation action');

		await client.action(api.ai_generation.generateAIResponse, {
			conversation_id: conversationId,
			session_token: sessionToken,
			model_id: args.model_id,
			reasoning_effort: args.reasoning_effort,
		});

		// 7. Trigger title generation in background (fire and forget)
		if (!args.conversation_id && args.message) {
			client
				.action(api.ai_generation.generateConversationTitle, {
					conversation_id: conversationId,
					session_token: sessionToken,
					user_message: args.message,
				})
				.catch((e) => {
					console.error('[GenerateMessage] Title generation failed:', e);
				});
		}

		const elapsed = Date.now() - startTime;
		console.log(`[GenerateMessage] Response sent, generation complete in ${elapsed}ms`);

		return response({ ok: true, conversation_id: conversationId });
	} catch (err) {
		const elapsed = Date.now() - startTime;
		console.error(`[GenerateMessage] Failed after ${elapsed}ms:`, err);

		// Try to reset generating status
		if (args.conversation_id) {
			try {
				await client.mutation(api.conversations.updateGenerating, {
					conversation_id: args.conversation_id as Id<'conversations'>,
					generating: false,
					session_token: sessionToken,
				});
			} catch (e) {
				console.error('[GenerateMessage] Failed to reset generating status:', e);
			}
		}

		return error(500, 'Failed to generate response');
	}
};
