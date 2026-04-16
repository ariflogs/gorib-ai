import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { type SessionObj } from './betterAuth';
import { PLANS } from '../../../lib/config';

// Helper functions for date/time handling
function getCurrentDay() {
	return new Date().toISOString().split('T')[0]; // "2026-04-16"
}

function getCurrentMonth(): string {
	return new Date().toISOString().slice(0, 7); // "2026-04"
}

function shouldResetDaily(currentDay: string): boolean {
	return currentDay !== getCurrentDay();
}

function shouldResetMonthly(currentMonth: string): boolean {
	return currentMonth !== getCurrentMonth();
}

// Get user's plan type from subscription
async function getUserPlanType(ctx: any, userId: string): Promise<string> {
	const now = Date.now();
	const subscription = await ctx.db
		.query('subscriptions')
		.withIndex('by_user_status', (q: any) =>
			q.eq('user_id', userId).eq('status', 'active')
		)
		.first();

	// Check if expired
	if (subscription && subscription.end_date >= now) {
		return subscription.plan;
	}

	return 'free';
}

// Get plan limits based on plan type
function getPlanLimits(planType: string, modelType: 'chat' | 'image') {
	if (planType === 'basic' || planType === 'pro') {
		const plan = PLANS[planType as keyof typeof PLANS];
		if (modelType === 'chat') {
			return {
				daily: plan.totalDailyChatLimit,
				monthly: plan.totalMonthlyChatLimit
			};
		} else {
			return {
				daily: plan.totalDailyImageLimit,
				monthly: plan.totalMonthlyImageLimit
			};
		}
	}

	return { daily: 0, monthly: 0 };
}

// Get model-specific limits from config
function getModelLimits(planType: string, modelId: string) {
	if (planType !== 'basic' && planType !== 'pro') {
		return null;
	}

	const plan = PLANS[planType as keyof typeof PLANS];

	if (!plan.models) {
		return null;
	}

	const model = plan.models.find((m: any) => m.id === modelId);

	if (!model) {
		return null;
	}

	// Check if model type matches (image models have 'image' tag)
	const isImageModel = model.tags?.includes('image');
	if ((model.type === 'image' && !isImageModel) || (model.type === 'chat' && isImageModel)) {
		return null;
	}

	return {
		dailyLimit: model.dailyLimit,
		monthlyLimit: model.monthlyLimit
	};
}

/**
 * Check if user can make a request
 * Returns: { allowed: boolean, reason?: string, remainingDaily?: number, remainingMonthly?: number }
 */
export const checkRateLimit = query({
	args: {
		session_token: v.string(),
		modelId: v.string(),
		modelType: v.string(), // "chat" | "image"
	},
	handler: async (ctx, args) => {
		// 1. Get user session
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Invalid session token');
		}

		const s = session as SessionObj;
		const userId = s.userId;

		// 2. Get user's subscription plan
		const planType = await getUserPlanType(ctx, userId);

		// Free and basic users have unlimited access
		if (planType === 'free' || planType === 'basic') {
			return {
				allowed: true,
				planType,
				remainingDaily: Infinity,
				remainingMonthly: Infinity
			};
		}

		// 3. Get current usage tracking record (READ ONLY - queries cannot insert)
		const usageRecord = await ctx.db
			.query('usageTracking')
			.withIndex('by_user', (q: any) => q.eq('userId', userId))
			.first();

		// If no record exists, assume zero usage (first request will create record)
		if (!usageRecord) {
			const overallLimits = getPlanLimits(planType, args.modelType as 'chat' | 'image');
			return {
				allowed: true,
				remainingDaily: overallLimits.daily - 1,
				remainingMonthly: overallLimits.monthly - 1,
				planType
			};
		}

		// 4. Get current usage (apply lazy reset logic without mutating)
		let dailyCount = usageRecord.dailyChatCount;
		let monthlyCount = usageRecord.monthlyChatCount;
		let dailyImageCount = usageRecord.dailyImageCount;
		let monthlyImageCount = usageRecord.monthlyImageCount;
		let modelUsage = usageRecord.modelUsage || {};

		// Apply lazy reset (just for calculation, not persisted here)
		if (shouldResetDaily(usageRecord.currentDay)) {
			dailyCount = 0;
			dailyImageCount = 0;
		}

		if (shouldResetMonthly(usageRecord.currentMonth)) {
			monthlyCount = 0;
			monthlyImageCount = 0;
		}

		const isChat = args.modelType === 'chat';
		const currentDaily = isChat ? dailyCount : dailyImageCount;
		const currentMonthly = isChat ? monthlyCount : monthlyImageCount;

		// 5. Check overall limits (daily/monthly)
		const overallLimits = getPlanLimits(planType, args.modelType as 'chat' | 'image');

		if (currentDaily >= overallLimits.daily) {
			return {
				allowed: false,
				reason: `Daily ${args.modelType} limit exceeded (${overallLimits.daily}/${overallLimits.daily})`,
				remainingDaily: 0,
				remainingMonthly: Math.max(0, overallLimits.monthly - currentMonthly),
				planType
			};
		}

		if (currentMonthly >= overallLimits.monthly) {
			return {
				allowed: false,
				reason: `Monthly ${args.modelType} limit exceeded (${overallLimits.monthly}/${overallLimits.monthly})`,
				remainingDaily: Math.max(0, overallLimits.daily - currentDaily),
				remainingMonthly: 0,
				planType
			};
		}

		// 6. Check per-model limits (daily/monthly) if they exist
		const modelUsageData = modelUsage[args.modelId] || { daily: 0, monthly: 0 };
		const modelLimits = getModelLimits(planType, args.modelId);

		if (modelLimits) {
			if (modelLimits.dailyLimit && modelUsageData.daily >= modelLimits.dailyLimit) {
				return {
					allowed: false,
					reason: `Daily limit for ${args.modelId} exceeded (${modelLimits.dailyLimit}/${modelLimits.dailyLimit})`,
					remainingDaily: Math.max(0, overallLimits.daily - currentDaily),
					remainingMonthly: Math.max(0, overallLimits.monthly - currentMonthly),
					planType
				};
			}

			if (modelLimits.monthlyLimit && modelUsageData.monthly >= modelLimits.monthlyLimit) {
				return {
					allowed: false,
					reason: `Monthly limit for ${args.modelId} exceeded (${modelLimits.monthlyLimit}/${modelLimits.monthlyLimit})`,
					remainingDaily: Math.max(0, overallLimits.daily - currentDaily),
					remainingMonthly: Math.max(0, overallLimits.monthly - currentMonthly),
					planType
				};
			}
		}

		// 7. Return success
		return {
			allowed: true,
			remainingDaily: overallLimits.daily - currentDaily - 1, // -1 for this request
			remainingMonthly: overallLimits.monthly - currentMonthly - 1,
			planType
		};
	}
});

/**
 * Increment usage counters after successful request
 */
export const incrementUsage = mutation({
	args: {
		session_token: v.string(),
		modelId: v.string(),
		modelType: v.string(), // "chat" | "image"
		inputTokens: v.optional(v.number()),
		outputTokens: v.optional(v.number()),
		imageCount: v.optional(v.number()),
		conversationId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// 1. Get user session
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Invalid session token');
		}

		const s = session as SessionObj;
		const userId = s.userId;

		// 2. Get user's subscription plan
		const planType = await getUserPlanType(ctx, userId);

		// Skip tracking for free/basic users
		if (planType === 'free' || planType === 'basic') {
			return { success: true };
		}

		// 3. Get or create usage tracking record
		let usageRecord = await ctx.db
			.query('usageTracking')
			.withIndex('by_user', (q: any) => q.eq('userId', userId))
			.first();

		const now = Date.now();
		const currentDay = getCurrentDay();
		if (!currentDay) {
			throw new Error('Failed to get current day');
		}
		const currentMonth = getCurrentMonth();
		if (!currentMonth) {
			throw new Error('Failed to get current month');
		}

		if (!usageRecord) {
			// Create new record
			await ctx.db.insert('usageTracking', {
				userId,
				planType,
				currentDay,
				currentMonth,
				dailyChatCount: args.modelType === 'chat' ? 1 : 0,
				monthlyChatCount: args.modelType === 'chat' ? 1 : 0,
				dailyImageCount: args.modelType === 'image' ? 1 : 0,
				monthlyImageCount: args.modelType === 'image' ? 1 : 0,
				modelUsage: {
					[args.modelId]: { daily: 1, monthly: 1 }
				},
				lastResetDaily: now,
				lastResetMonthly: now,
				updatedAt: now,
			});
		} else {
			// Update existing record
			let updates: any = {
				updatedAt: now,
				planType, // Update plan type in case it changed
			};

			// Reset if needed
			const needsDailyReset = shouldResetDaily(usageRecord.currentDay);
			const needsMonthlyReset = shouldResetMonthly(usageRecord.currentMonth);

			let dailyChatCount = needsDailyReset ? 0 : usageRecord.dailyChatCount;
			let monthlyChatCount = needsMonthlyReset ? 0 : usageRecord.monthlyChatCount;
			let dailyImageCount = needsDailyReset ? 0 : usageRecord.dailyImageCount;
			let monthlyImageCount = needsMonthlyReset ? 0 : usageRecord.monthlyImageCount;
			let modelUsage = usageRecord.modelUsage || {};

			if (needsDailyReset) {
				updates.currentDay = currentDay;
				updates.lastResetDaily = now;
				// Reset daily counts in modelUsage
				for (const key in modelUsage) {
					if (modelUsage[key]) {
						modelUsage[key].daily = 0;
					}
				}
			}

			if (needsMonthlyReset) {
				updates.currentMonth = currentMonth;
				updates.lastResetMonthly = now;
				// Reset monthly counts in modelUsage
				for (const key in modelUsage) {
					if (modelUsage[key]) {
						modelUsage[key].monthly = 0;
					}
				}
			}

			// Increment counters
			if (args.modelType === 'chat') {
				dailyChatCount++;
				monthlyChatCount++;
			} else {
				dailyImageCount++;
				monthlyImageCount++;
			}

			// Increment model-specific counters
			if (!modelUsage[args.modelId]) {
				modelUsage[args.modelId] = { daily: 0, monthly: 0 };
			}
			modelUsage[args.modelId].daily++;
			modelUsage[args.modelId].monthly++;

			updates.dailyChatCount = dailyChatCount;
			updates.monthlyChatCount = monthlyChatCount;
			updates.dailyImageCount = dailyImageCount;
			updates.monthlyImageCount = monthlyImageCount;
			updates.modelUsage = modelUsage;

			await ctx.db.patch(usageRecord._id, updates);
		}

		// 4. Optionally log to requestLog for analytics
		await ctx.db.insert('requestLog', {
			userId,
			modelId: args.modelId,
			modelType: args.modelType,
			planType,
			inputTokens: args.inputTokens,
			outputTokens: args.outputTokens,
			imageCount: args.imageCount,
			estimatedCost: 0, // Calculate based on token costs if needed
			timestamp: now,
			conversationId: args.conversationId,
			success: true,
		});

		return { success: true };
	}
});

/**
 * Get current usage statistics for user
 */
export const getUsageStats = query({
	args: {
		session_token: v.string(),
	},
	handler: async (ctx, args) => {
		// Get user session
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Invalid session token');
		}

		const s = session as SessionObj;
		const userId = s.userId;

		// Get user's subscription plan
		const planType = await getUserPlanType(ctx, userId);

		// Get usage record
		const usageRecord = await ctx.db
			.query('usageTracking')
			.withIndex('by_user', (q: any) => q.eq('userId', userId))
			.first();

		if (!usageRecord) {
			return {
				planType,
				dailyChatCount: 0,
				monthlyChatCount: 0,
				dailyImageCount: 0,
				monthlyImageCount: 0,
				chatLimits: getPlanLimits(planType, 'chat'),
				imageLimits: getPlanLimits(planType, 'image'),
				modelUsage: {},
			};
		}

		// Apply lazy reset if needed (for display purposes only)
		let dailyChatCount = usageRecord.dailyChatCount;
		let monthlyChatCount = usageRecord.monthlyChatCount;
		let dailyImageCount = usageRecord.dailyImageCount;
		let monthlyImageCount = usageRecord.monthlyImageCount;
		let modelUsage = usageRecord.modelUsage || {};

		if (shouldResetDaily(usageRecord.currentDay)) {
			dailyChatCount = 0;
			dailyImageCount = 0;
			for (const key in modelUsage) {
				if (modelUsage[key]) {
					modelUsage[key].daily = 0;
				}
			}
		}

		if (shouldResetMonthly(usageRecord.currentMonth)) {
			monthlyChatCount = 0;
			monthlyImageCount = 0;
			for (const key in modelUsage) {
				if (modelUsage[key]) {
					modelUsage[key].monthly = 0;
				}
			}
		}

		return {
			planType,
			dailyChatCount,
			monthlyChatCount,
			dailyImageCount,
			monthlyImageCount,
			chatLimits: getPlanLimits(planType, 'chat'),
			imageLimits: getPlanLimits(planType, 'image'),
			modelUsage,
		};
	}
});
