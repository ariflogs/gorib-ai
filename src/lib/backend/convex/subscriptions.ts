import { internal } from './_generated/api';
import { query, internalMutation } from './_generated/server';
import { type SessionObj } from './betterAuth';
import { mutation } from './functions';
import { v } from 'convex/values';
import { subscriptionPlanValidator, type SubscriptionPlan } from './schema';
import { PLANS } from '../../../lib/config';

/**
 * Get the current active subscription for a user
 */
export const getCurrentSubscription = query({
	args: {
		session_token: v.string(),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Invalid session token');
		}

		const s = session as SessionObj;
		const now = Date.now();

		// Get active subscription
		const subscription = await ctx.db
			.query('subscriptions')
			.withIndex('by_user_status', (q) => q.eq('user_id', s.userId).eq('status', 'active'))
			.first();

		// Check if expired (but don't update)
		if (subscription && subscription.end_date < now) {
			return null;
		}

		return subscription;
	},
});

/**
 * Get all subscriptions for a user (for admin/history purposes)
 */
export const getAllSubscriptions = query({
	args: {
		session_token: v.string(),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Invalid session token');
		}

		const s = session as SessionObj;

		return await ctx.db
			.query('subscriptions')
			.withIndex('by_user', (q) => q.eq('user_id', s.userId))
			.order('desc')
			.collect();
	},
});

/**
 * Check if user can access a specific model based on their subscription
 */
export const canAccessModel = query({
	args: {
		session_token: v.string(),
		model_id: v.string(),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Invalid session token');
		}

		const s = session as SessionObj;
		const now = Date.now();

		const subscription = await ctx.db
			.query('subscriptions')
			.withIndex('by_user_status', (q) => q.eq('user_id', s.userId).eq('status', 'active'))
			.first();

		// Check if expired
		const plan: SubscriptionPlan =
			subscription && subscription.end_date >= now ? subscription.plan : 'free';

		// Free users have no models
		if (plan === 'free') {
			return false;
		}

		const allowedModels = PLANS[plan as keyof typeof PLANS].models.map((m) => m.id);
		return allowedModels.includes(args.model_id);
	},
});

/**
 * Get user's current plan and allowed models
 */
export const getUserPlanInfo = query({
	args: {
		session_token: v.string(),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Invalid session token');
		}

		const s = session as SessionObj;
		const now = Date.now();

		const subscription = await ctx.db
			.query('subscriptions')
			.withIndex('by_user_status', (q) => q.eq('user_id', s.userId).eq('status', 'active'))
			.first();

		// Determine actual plan and status
		const isExpired = subscription && subscription.end_date < now;
		const plan: SubscriptionPlan = subscription && !isExpired ? subscription.plan : 'free';
		const status = subscription && !isExpired ? 'active' : null;

		// Free users have no models
		const allowedModels = plan === 'free' ? [] : PLANS[plan as keyof typeof PLANS].models.map((m) => m.id);

		return {
			plan,
			status,
			allowed_models: allowedModels,
			start_date: subscription?.start_date,
			end_date: subscription?.end_date,
		};
	},
});

/**
 * Create or update a subscription (admin only - called manually when payment is confirmed)
 * This should NOT be called from the client in production
 */
export const createOrUpdateSubscription = mutation({
	args: {
		user_id: v.string(),
		plan: subscriptionPlanValidator,
		duration_days: v.number(),
		payment_method: v.optional(v.string()),
		transaction_id: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const endDate = now + args.duration_days * 24 * 60 * 60 * 1000;

		// Check if user has an active subscription
		const existingActive = await ctx.db
			.query('subscriptions')
			.withIndex('by_user_status', (q) => q.eq('user_id', args.user_id).eq('status', 'active'))
			.first();

		if (existingActive) {
			// Cancel existing active subscription
			await ctx.db.patch(existingActive._id, {
				status: 'cancelled',
				notes: `Cancelled due to new subscription: ${args.plan}`,
			});
		}

		// Create new subscription
		const subscriptionId = await ctx.db.insert('subscriptions', {
			user_id: args.user_id,
			plan: args.plan,
			status: 'active',
			start_date: now,
			end_date: endDate,
			payment_method: args.payment_method,
			transaction_id: args.transaction_id,
			notes: args.notes,
		});

		return subscriptionId;
	},
});

/**
 * Cancel a subscription
 */
export const cancelSubscription = mutation({
	args: {
		user_id: v.string(),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const activeSubscription = await ctx.db
			.query('subscriptions')
			.withIndex('by_user_status', (q) => q.eq('user_id', args.user_id).eq('status', 'active'))
			.first();

		if (!activeSubscription) {
			throw new Error('No active subscription found');
		}

		await ctx.db.patch(activeSubscription._id, {
			status: 'cancelled',
			notes: args.notes || 'Cancelled by user',
		});

		return { success: true };
	},
});

/**
 * Extend an existing subscription
 */
export const extendSubscription = mutation({
	args: {
		user_id: v.string(),
		additional_days: v.number(),
		payment_method: v.optional(v.string()),
		transaction_id: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const activeSubscription = await ctx.db
			.query('subscriptions')
			.withIndex('by_user_status', (q) => q.eq('user_id', args.user_id).eq('status', 'active'))
			.first();

		if (!activeSubscription) {
			throw new Error('No active subscription found');
		}

		const newEndDate = activeSubscription.end_date + args.additional_days * 24 * 60 * 60 * 1000;

		await ctx.db.patch(activeSubscription._id, {
			end_date: newEndDate,
			notes: args.notes || `Extended by ${args.additional_days} days`,
		});

		return { success: true, new_end_date: newEndDate };
	},
});

/**
 * Internal mutation to expire old subscriptions (call this from a cron job)
 */
export const expireOldSubscriptions = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		// Get all active subscriptions
		const activeSubscriptions = await ctx.db
			.query('subscriptions')
			.withIndex('by_status', (q) => q.eq('status', 'active'))
			.collect();

		let expiredCount = 0;

		// Mark expired ones
		for (const subscription of activeSubscriptions) {
			if (subscription.end_date < now) {
				await ctx.db.patch(subscription._id, {
					status: 'expired',
				});
				expiredCount++;
			}
		}

		return { expired: expiredCount };
	},
});

/**
 * Helper to get allowed models for a plan
 */
export const getAllowedModels = query({
	args: {
		plan: subscriptionPlanValidator,
	},
	handler: async (ctx, args) => {
		if (args.plan === 'free') {
			return [];
		}
		return PLANS[args.plan as keyof typeof PLANS].models;
	},
});
