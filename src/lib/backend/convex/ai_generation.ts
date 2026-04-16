import { v } from 'convex/values';
import { action } from './_generated/server';
import { api, internal } from './_generated/api';
import OpenAI from 'openai';
import type { Id } from './_generated/dataModel';
import { getOpenRouterModelId, getModelById } from './utils/models';
import { md } from './utils/markdown_renderer';
import * as array from './utils/array';
import { parseMessageForRules } from './utils/rules';
import { Provider, type Annotation } from './utils/types';
import type { SessionObj } from './betterAuth';

// Helper function to get generation stats from OpenRouter
async function getGenerationStats(
	generationId: string,
	token: string
): Promise<{ ok: true; data: GenerationData } | { ok: false; error: string }> {
	try {
		const generation = await fetch(`https://openrouter.ai/api/v1/generation?id=${generationId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const { data } = await generation.json();

		if (!data) {
			return { ok: false, error: 'No data returned from OpenRouter' };
		}

		return { ok: true, data };
	} catch (e) {
		return { ok: false, error: `Failed to get generation stats: ${e}` };
	}
}

// Helper function to retry operations
async function retryOperation<T>(
	fn: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>,
	{ retries, delay }: { retries: number; delay: number }
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
	let attempts = 0;
	let lastResult: { ok: true; data: T } | { ok: false; error: string } | null = null;

	while (attempts <= retries) {
		lastResult = await fn();

		if (lastResult.ok) return lastResult;

		await new Promise((resolve) => setTimeout(resolve, delay));
		attempts++;
	}

	return lastResult || { ok: false, error: 'No attempts made' };
}

// Helper function to handle generation errors
async function handleGenerationError(
	ctx: any,
	{
		error,
		conversationId,
		messageId,
		sessionToken,
	}: {
		error: string;
		conversationId: string;
		messageId: string | undefined;
		sessionToken: string;
	}
) {
	console.error(`Generation error: ${error}`);

	try {
		await ctx.runMutation(api.messages.updateError, {
			conversation_id: conversationId as Id<'conversations'>,
			message_id: messageId,
			error,
			session_token: sessionToken,
		});
	} catch (e) {
		console.error(`Failed to update error message: ${e}`);
	}
}

export const generateAIResponse = action({
	args: {
		conversation_id: v.string(),
		session_token: v.string(),
		model_id: v.string(),
		reasoning_effort: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
	},
	handler: async (ctx, args) => {
		const startTime = Date.now();
		console.log(`[AI Generation] Starting for conversation ${args.conversation_id}`);

		try {
			// 1. Get session for authentication
			const session = await ctx.runQuery(internal.betterAuth.getSession, {
				sessionToken: args.session_token,
			});

			if (!session) {
				throw new Error('Unauthorized: Invalid session');
			}

			const s = session as SessionObj;

			// 2. Get plan info to check model access
			const planInfo = await ctx.runQuery(api.subscriptions.getUserPlanInfo, {
				session_token: args.session_token,
			});

			const userPlan = planInfo.plan || 'free';

			// 3. Get model info and verify access
			const modelWithPlan = getModelById(args.model_id, userPlan);

			if (!modelWithPlan) {
				throw new Error('Model not found in configuration');
			}

			if (modelWithPlan.requiresUpgrade) {
				throw new Error(
					`Model ${modelWithPlan.name} requires ${modelWithPlan.lowestPlan} plan or higher`
				);
			}

			console.log(`[AI Generation] Model ${modelWithPlan.name} is accessible`);

			// 4. Get messages from conversation
			const messages = await ctx.runQuery(api.messages.getAllFromConversation, {
				conversation_id: args.conversation_id,
				session_token: args.session_token,
			});

			console.log(`[AI Generation] Retrieved ${messages.length} messages`);

			// 5. Check web search setting
			const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
			const webSearchEnabled = lastUserMessage?.web_search_enabled ?? false;

			// 6. Get OpenRouter model ID and append :online if web search enabled
			const openRouterModelId = getOpenRouterModelId(args.model_id);
			const finalModelId = webSearchEnabled ? `${openRouterModelId}:online` : openRouterModelId;

			console.log(`[AI Generation] Using model: ${finalModelId}`);

			// 7. Create assistant message
			const messageId = await ctx.runMutation(api.messages.create, {
				conversation_id: args.conversation_id,
				model_id: args.model_id,
				provider: Provider.OpenRouter,
				content: '',
				role: 'assistant',
				session_token: args.session_token,
				web_search_enabled: webSearchEnabled,
			});

			console.log(`[AI Generation] Created assistant message: ${messageId}`);

			// 8. Get API key (user's or environment)
			const userKeyResult = await ctx.runQuery(api.user_keys.get, {
				provider: Provider.OpenRouter,
				session_token: args.session_token,
			});

			const envKey = process.env.OPENROUTER_FREE_KEY;
			if (!envKey) {
				throw new Error('OPENROUTER_FREE_KEY not configured in Convex environment');
			}

			const actualKey = userKeyResult || envKey;
			console.log(`[AI Generation] Using ${userKeyResult ? 'user' : 'environment'} API key`);

			// 9. Get user rules
			const userRules = await ctx.runQuery(api.user_rules.all, {
				session_token: args.session_token,
			});

			let attachedRules = userRules.filter((r) => r.attach === 'always');

			// Parse rules from messages
			for (const message of messages) {
				const parsedRules = parseMessageForRules(
					message.content,
					userRules.filter((r) => r.attach === 'manual')
				);
				attachedRules.push(...parsedRules);
			}

			// Remove duplicates
			attachedRules = array.fromMap(
				array.toMap(attachedRules, (r) => [r._id, r]),
				(_k, v) => v
			);

			console.log(`[AI Generation] Attached ${attachedRules.length} rules`);

			// 10. Initialize OpenAI client
			const openai = new OpenAI({
				baseURL: 'https://openrouter.ai/api/v1',
				apiKey: actualKey,
			});

			// 11. Format messages for API
			const formattedMessages = messages.map((m) => {
				if (m.images && m.images.length > 0 && m.role === 'user') {
					return {
						role: 'user' as const,
						content: [
							{ type: 'text' as const, text: m.content },
							...m.images.map((img) => ({
								type: 'image_url' as const,
								image_url: { url: img.url },
							})),
						],
					};
				}
				return {
					role: m.role as 'user' | 'assistant' | 'system',
					content: m.content,
				};
			});

			// Add system message if there are rules
			const messagesToSend =
				attachedRules.length > 0
					? [
							...formattedMessages,
							{
								role: 'system' as const,
								content: `The user has mentioned one or more rules to follow with the @<rule_name> syntax. Please follow these rules as they apply.
Rules to follow:
${attachedRules.map((r) => `- ${r.name}: ${r.rule}`).join('\n')}`,
							},
						]
					: formattedMessages;

			// 12. Create streaming completion
			const stream = await openai.chat.completions.create({
				model: finalModelId,
				messages: messagesToSend,
				temperature: 0.7,
				stream: true,
				reasoning_effort: args.reasoning_effort,
			});

			console.log(`[AI Generation] OpenAI stream created`);

			// 13. Process stream chunks
			let content = '';
			let reasoning = '';
			let chunkCount = 0;
			let generationId: string | null = null;
			const annotations: Annotation[] = [];

			for await (const chunk of stream) {
				chunkCount++;

				// @ts-expect-error OpenRouter extends standard response
				reasoning += chunk.choices[0]?.delta?.reasoning || '';
				content += chunk.choices[0]?.delta?.content || '';
				// @ts-expect-error OpenRouter extends standard response
				annotations.push(...(chunk.choices[0]?.delta?.annotations ?? []));

				if (!content && !reasoning) continue;

				generationId = chunk.id;

				// Update message with new content
				await ctx.runMutation(api.messages.updateContent, {
					message_id: messageId,
					content,
					reasoning: reasoning.length > 0 ? reasoning : undefined,
					session_token: args.session_token,
					generation_id: generationId,
					annotations,
					reasoning_effort: args.reasoning_effort,
				});
			}

			console.log(`[AI Generation] Processed ${chunkCount} chunks, content length: ${content.length}`);

			if (!generationId) {
				throw new Error('No generation ID received from OpenRouter');
			}

			// 14. Render content as HTML
			const contentHtml = await md.renderAsync(content);

			// 15. Get generation stats from OpenRouter (with retries)
			const statsResult = await retryOperation(() => getGenerationStats(generationId!, actualKey), {
				delay: 500,
				retries: 2,
			});

			const generationStats = statsResult.ok
				? statsResult.data
				: { tokens_completion: undefined, total_cost: undefined, tokens_prompt: undefined };

			console.log(`[AI Generation] Got generation stats: ${JSON.stringify(generationStats)}`);

			// 16. Update message with final stats
			await ctx.runMutation(api.messages.updateMessage, {
				message_id: messageId,
				token_count: generationStats.tokens_completion,
				cost_usd: generationStats.total_cost,
				generation_id: generationId,
				session_token: args.session_token,
				content_html: contentHtml,
			});

			// 17. Mark conversation as not generating
			await ctx.runMutation(api.conversations.updateGenerating, {
				conversation_id: args.conversation_id as Id<'conversations'>,
				generating: false,
				session_token: args.session_token,
			});

			// 18. Update conversation cost
			await ctx.runMutation(api.conversations.updateCostUsd, {
				conversation_id: args.conversation_id as Id<'conversations'>,
				cost_usd: generationStats.total_cost ?? 0,
				session_token: args.session_token,
			});

			// 19. Increment usage counters for rate limiting
			await ctx.runMutation(api.rate_limiter.incrementUsage, {
				session_token: args.session_token,
				modelId: args.model_id,
				modelType: 'chat',
				inputTokens: generationStats.tokens_prompt,
				outputTokens: generationStats.tokens_completion,
				conversationId: args.conversation_id,
			});

			const elapsed = Date.now() - startTime;
			console.log(`[AI Generation] Completed successfully in ${elapsed}ms`);

			return { ok: true };
		} catch (error) {
			const elapsed = Date.now() - startTime;
			console.error(`[AI Generation] Failed after ${elapsed}ms:`, error);

			await handleGenerationError(ctx, {
				error: String(error),
				conversationId: args.conversation_id,
				messageId: undefined,
				sessionToken: args.session_token,
			});

			throw error;
		}
	},
});

export const generateConversationTitle = action({
	args: {
		conversation_id: v.string(),
		session_token: v.string(),
		user_message: v.string(),
	},
	handler: async (ctx, args) => {
		console.log(`[Title Generation] Starting for conversation ${args.conversation_id}`);

		try {
			// 1. Get all conversations to check if this one needs a title
			const conversations = await ctx.runQuery(api.conversations.get, {
				session_token: args.session_token,
			});

			const conversation = conversations.find((c) => c._id === args.conversation_id);

			if (!conversation) {
				console.log('[Title Generation] Conversation not found');
				return;
			}

			// 2. Get API key
			const userKeyResult = await ctx.runQuery(api.user_keys.get, {
				provider: Provider.OpenRouter,
				session_token: args.session_token,
			});

			const envKey = process.env.OPENROUTER_FREE_KEY;
			if (!envKey) {
				throw new Error('OPENROUTER_FREE_KEY not configured in Convex environment');
			}

			const actualKey = userKeyResult || envKey;

			// 3. Initialize OpenAI client
			const openai = new OpenAI({
				baseURL: 'https://openrouter.ai/api/v1',
				apiKey: actualKey,
			});

			// 4. Generate title
			const titlePrompt = `Based on this message:
"""${args.user_message}"""

Generate a concise, specific title (max 4-5 words).
Generate only the title based on the message, nothing else. Don't name the title 'Generate Title' or anything stupid like that, otherwise its obvious we're generating a title with AI.

Also, do not interact with the message directly or answer it. Just generate the title based on the message.

If its a simple hi, just name it "Greeting" or something like that.
`;

			const titleResponse = await openai.chat.completions.create({
				model: 'mistralai/ministral-8b',
				messages: [{ role: 'user', content: titlePrompt }],
				max_tokens: 20,
				temperature: 0.5,
			});

			const rawTitle = titleResponse.choices[0]?.message?.content?.trim();

			if (!rawTitle) {
				console.log('[Title Generation] No title generated');
				return;
			}

			// Strip surrounding quotes if present
			const generatedTitle = rawTitle.replace(/^["']|["']$/g, '');

			// 5. Update conversation title
			await ctx.runMutation(api.conversations.updateTitle, {
				conversation_id: args.conversation_id as Id<'conversations'>,
				title: generatedTitle,
				session_token: args.session_token,
			});

			console.log(`[Title Generation] Successfully updated title to "${generatedTitle}"`);
		} catch (error) {
			console.error('[Title Generation] Failed:', error);
			// Don't throw - title generation is not critical
		}
	},
});

// Type for generation data from OpenRouter
interface GenerationData {
	tokens_prompt?: number;
	tokens_completion?: number;
	total_cost?: number;
	[key: string]: any;
}
