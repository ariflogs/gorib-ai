import { defineSchema, defineTable } from 'convex/server';
import { type Infer, v } from 'convex/values';
import { Provider } from '../../../lib/types';

export const providerValidator = v.union(...Object.values(Provider).map((p) => v.literal(p)));
export const messageRoleValidator = v.union(
	v.literal('user'),
	v.literal('assistant'),
	v.literal('system')
);
export const reasoningEffortValidator = v.union(
	v.literal('low'),
	v.literal('medium'),
	v.literal('high')
);

export type MessageRole = Infer<typeof messageRoleValidator>;

export const ruleAttachValidator = v.union(v.literal('always'), v.literal('manual'));

export const subscriptionPlanValidator = v.union(
	v.literal('free'),
	v.literal('basic'),
	v.literal('pro')
);

export const subscriptionStatusValidator = v.union(
	v.literal('active'),
	v.literal('expired'),
	v.literal('cancelled')
);

export type SubscriptionPlan = Infer<typeof subscriptionPlanValidator>;
export type SubscriptionStatus = Infer<typeof subscriptionStatusValidator>;

export const userRoleValidator = v.union(v.literal('user'), v.literal('admin'));
export type UserRole = Infer<typeof userRoleValidator>;

export default defineSchema({
	user: defineTable({
		name: v.optional(v.string()),
		email: v.string(),
		emailVerified: v.boolean(),
		image: v.optional(v.string()),
		_creationTime: v.string(),
		updatedAt: v.string(),
	}).index('by_email', ['email']),
	user_roles: defineTable({
		user_id: v.string(),
		role: userRoleValidator,
	}).index('by_user', ['user_id']),
	user_settings: defineTable({
		user_id: v.string(),
		privacy_mode: v.boolean(),
		free_messages_used: v.optional(v.number()),
	}).index('by_user', ['user_id']),
	subscriptions: defineTable({
		user_id: v.string(),
		plan: subscriptionPlanValidator,
		status: subscriptionStatusValidator,
		start_date: v.number(),
		end_date: v.number(),
		payment_method: v.optional(v.string()),
		transaction_id: v.optional(v.string()),
		notes: v.optional(v.string()),
	})
		.index('by_user', ['user_id'])
		.index('by_status', ['status'])
		.index('by_user_status', ['user_id', 'status']),
	user_keys: defineTable({
		user_id: v.string(),
		provider: providerValidator,
		key: v.string(),
	})
		.index('by_user', ['user_id'])
		.index('by_provider_user', ['provider', 'user_id']),
	user_enabled_models: defineTable({
		user_id: v.string(),
		provider: providerValidator,
		/** Different providers may use different ids for the same model */
		model_id: v.string(),
		// null is just here for compat we treat null as true
		pinned: v.optional(v.union(v.boolean(), v.null())),
	})
		.index('by_user', ['user_id'])
		.index('by_model_provider', ['model_id', 'provider'])
		.index('by_provider_user', ['provider', 'user_id'])
		.index('by_model_provider_user', ['model_id', 'provider', 'user_id']),
	user_rules: defineTable({
		user_id: v.string(),
		name: v.string(),
		attach: ruleAttachValidator,
		rule: v.string(),
	})
		.index('by_user', ['user_id'])
		.index('by_user_attach', ['user_id', 'attach'])
		.index('by_user_name', ['user_id', 'name']),
	conversations: defineTable({
		user_id: v.string(),
		title: v.string(),
		updated_at: v.optional(v.number()),
		pinned: v.optional(v.boolean()),
		generating: v.optional(v.boolean()),
		cost_usd: v.optional(v.number()),
		public: v.optional(v.boolean()),
		branched_from: v.optional(v.id('conversations')),
	}).index('by_user', ['user_id']),
	messages: defineTable({
		conversation_id: v.string(),
		role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
		content: v.string(),
		content_html: v.optional(v.string()),
		reasoning: v.optional(v.string()),
		error: v.optional(v.string()),
		// Optional, coming from SK API route
		model_id: v.optional(v.string()),
		provider: v.optional(providerValidator),
		token_count: v.optional(v.number()),
		// Optional image attachments
		images: v.optional(
			v.array(
				v.object({
					url: v.string(),
					storage_id: v.string(),
					fileName: v.optional(v.string()),
				})
			)
		),
		cost_usd: v.optional(v.number()),
		generation_id: v.optional(v.string()),
		web_search_enabled: v.optional(v.boolean()),
		reasoning_effort: v.optional(reasoningEffortValidator),
		annotations: v.optional(v.array(v.record(v.string(), v.any()))),
	}).index('by_conversation', ['conversation_id']),
	usageTracking: defineTable({
		userId: v.string(),
		planType: v.string(), // "starter" | "pro" | "basic" | "free"

		// Period tracking
		currentDay: v.string(), // ISO date format "2026-04-16"
		currentMonth: v.string(), // "2026-04"

		// Overall counters
		dailyChatCount: v.number(),
		monthlyChatCount: v.number(),
		dailyImageCount: v.number(),
		monthlyImageCount: v.number(),

		// Per-model counters (JSON object)
		modelUsage: v.any(), // { "modelId": { daily: number, monthly: number } }

		// Timestamps
		lastResetDaily: v.number(),
		lastResetMonthly: v.number(),
		updatedAt: v.number(),
	})
		.index('by_user', ['userId'])
		.index('by_user_and_day', ['userId', 'currentDay'])
		.index('by_user_and_month', ['userId', 'currentMonth']),
	requestLog: defineTable({
		userId: v.string(),
		modelId: v.string(),
		modelType: v.string(), // "chat" | "image"
		planType: v.string(),

		// Token/usage tracking
		inputTokens: v.optional(v.number()),
		outputTokens: v.optional(v.number()),
		imageCount: v.optional(v.number()),

		// Cost tracking
		estimatedCost: v.number(), // in BDT paisa

		// Metadata
		timestamp: v.number(),
		conversationId: v.optional(v.string()),
		success: v.boolean(),
		errorReason: v.optional(v.string()),
	})
		.index('by_user', ['userId'])
		.index('by_user_and_date', ['userId', 'timestamp'])
		.index('by_model', ['modelId']),
});
