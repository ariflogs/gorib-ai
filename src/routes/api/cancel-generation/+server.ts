/**
 * TEMPORARY: Cancellation feature disabled
 *
 * This endpoint has been temporarily disabled because AI generation has been moved to Convex actions,
 * which don't support the AbortController pattern used here.
 *
 * To re-enable cancellation:
 * 1. Add a "cancelled" field to the conversations table
 * 2. In the Convex action, check this field periodically during streaming
 * 3. If cancelled is true, break out of the stream loop
 * 4. Update this endpoint to set the cancelled field instead of using AbortController
 */

import { error, json, type RequestHandler } from '@sveltejs/kit';

export type CancelGenerationResponse = {
	ok: false;
	error: string;
};

function response(res: CancelGenerationResponse) {
	return json(res);
}

export const POST: RequestHandler = async ({ request }) => {
	// Cancellation temporarily disabled
	return response({
		ok: false,
		error: 'Cancellation feature temporarily disabled. Will be re-enabled in a future update.',
	});
};

/* ORIGINAL CODE - Keep for reference when re-implementing

import { api } from '$lib/backend/convex/_generated/api';
import type { Id } from '$lib/backend/convex/_generated/dataModel';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { ResultAsync } from 'neverthrow';
import { z } from 'zod/v4';
import { getSessionCookie } from 'better-auth/cookies';
import { PUBLIC_CONVEX_URL } from '$env/static/public';

// Import the global cache from generate-message
import { generationAbortControllers } from '../generate-message/cache.js';

const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);

const reqBodySchema = z.object({
	conversation_id: z.string(),
	session_token: z.string(),
});

export type CancelGenerationRequestBody = z.infer<typeof reqBodySchema>;

export type CancelGenerationResponse = {
	ok: true;
	cancelled: boolean;
};

function response(res: CancelGenerationResponse) {
	return json(res);
}

export const POST: RequestHandler = async ({ request }) => {
	const bodyResult = await ResultAsync.fromPromise(
		request.json(),
		() => 'Failed to parse request body'
	);

	if (bodyResult.isErr()) {
		return error(400, 'Failed to parse request body');
	}

	const parsed = reqBodySchema.safeParse(bodyResult.value);
	if (!parsed.success) {
		return error(400, parsed.error);
	}
	const args = parsed.data;

	const cookie = getSessionCookie(request.headers);
	const sessionToken = cookie?.split('.')[0] ?? null;

	if (!sessionToken || sessionToken !== args.session_token) {
		return error(401, 'Unauthorized');
	}

	// Verify the user owns this conversation
	const conversationResult = await ResultAsync.fromPromise(
		client.query(api.conversations.getById, {
			conversation_id: args.conversation_id as Id<'conversations'>,
			session_token: sessionToken,
		}),
		(e) => `Failed to get conversation: ${e}`
	);

	if (conversationResult.isErr()) {
		return error(403, 'Conversation not found or unauthorized');
	}

	// Try to cancel the generation
	const abortController = generationAbortControllers.get(args.conversation_id);
	let cancelled = false;

	if (abortController) {
		abortController.abort();
		generationAbortControllers.delete(args.conversation_id);
		cancelled = true;

		// Update conversation generating status to false
		await ResultAsync.fromPromise(
			client.mutation(api.conversations.updateGenerating, {
				conversation_id: args.conversation_id as Id<'conversations'>,
				generating: false,
				session_token: sessionToken,
			}),
			(e) => `Failed to update generating status: ${e}`
		);
	}

	return response({ ok: true, cancelled });
};

*/
