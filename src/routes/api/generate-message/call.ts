import { ResultAsync } from 'neverthrow';
import type { GenerateMessageRequestBody, GenerateMessageResponse } from './+server';

export async function callGenerateMessage(args: GenerateMessageRequestBody) {
	const res = ResultAsync.fromPromise(
		(async () => {
			const res = await fetch('/api/generate-message', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(args),
			});

			if (!res.ok) {
				// Handle rate limit errors specially
				if (res.status === 429) {
					const text = await res.text();
					throw new Error(text || 'Rate limit exceeded. Please try again later.');
				}

				// Try to get error message from response
				try {
					const { message } = await res.json();
					throw new Error(message as string);
				} catch {
					throw new Error(`Request failed with status ${res.status}`);
				}
			}

			return res.json() as Promise<GenerateMessageResponse>;
		})(),
		(e) => `${e}`
	);

	return res;
}
