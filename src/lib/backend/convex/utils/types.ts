import { z } from 'zod';

export const Provider = {
	OpenRouter: 'openrouter',
	HuggingFace: 'huggingface',
	OpenAI: 'openai',
	Anthropic: 'anthropic',
} as const;

export type Provider = (typeof Provider)[keyof typeof Provider];

export const UrlCitationSchema = z.object({
	type: z.literal('url_citation'),
	url_citation: z.object({
		end_index: z.number(),
		start_index: z.number(),
		title: z.string(),
		url: z.string(),
		content: z.string(),
	}),
});

export type UrlCitation = z.infer<typeof UrlCitationSchema>;

export const AnnotationSchema = UrlCitationSchema;
export type Annotation = z.infer<typeof AnnotationSchema>;
