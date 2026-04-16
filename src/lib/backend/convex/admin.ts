import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import { subscriptionPlanValidator } from './schema';
import type { SessionObj } from './betterAuth';
import type { QueryCtx, MutationCtx } from './_generated/server';

/**
 * Check if a user is an admin
 */
async function isAdmin(ctx: QueryCtx | MutationCtx, userId: string): Promise<boolean> {
	const userRole = await ctx.db
		.query('user_roles')
		.withIndex('by_user', (q) => q.eq('user_id', userId))
		.first();

	return userRole?.role === 'admin';
}

/**
 * Get all users with their subscription info (admin only)
 */
export const getAllUsers = query({
	args: {
		session_token: v.string(),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Not authenticated');
		}

		const s = session as SessionObj;

		// Check if user is admin
		const adminCheck = await isAdmin(ctx, s.userId);
		if (!adminCheck) {
			throw new Error('Not authorized - admin access required');
		}

		// Get all users from better-auth user table
		const users = await ctx.db.query('user').collect();

		// Get subscription info for each user
		const usersWithSubscriptions = await Promise.all(
			users.map(async (user) => {
				// Get active or most recent subscription
				const subscription = await ctx.db
					.query('subscriptions')
					.withIndex('by_user', (q) => q.eq('user_id', user._id))
					.order('desc')
					.first();

				return {
					id: user._id,
					name: user?.name,
					email: user?.email,
					image: user?.image,
					createdAt: user?._creationTime,
					subscription: subscription
						? {
								id: subscription._id,
								plan: subscription.plan,
								status: subscription.status,
								start_date: subscription.start_date,
								end_date: subscription.end_date,
								payment_method: subscription.payment_method,
								transaction_id: subscription.transaction_id,
								notes: subscription.notes,
						  }
						: null,
				};
			})
		);

		return usersWithSubscriptions;
	},
});

/**
 * Create or update a user's subscription (admin only)
 */
export const createUserSubscription = mutation({
	args: {
		session_token: v.string(),
		user_id: v.string(),
		plan: subscriptionPlanValidator,
		duration_days: v.number(),
		payment_method: v.optional(v.string()),
		transaction_id: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Not authenticated');
		}

		const s = session as SessionObj;

		// Check if user is admin
		const adminCheck = await isAdmin(ctx, s.userId);
		if (!adminCheck) {
			throw new Error('Not authorized - admin access required');
		}

		const now = Date.now();
		const endDate = now + args.duration_days * 24 * 60 * 60 * 1000;

		// Cancel any existing active subscriptions
		const existingSubscriptions = await ctx.db
			.query('subscriptions')
			.withIndex('by_user_status', (q) =>
				q.eq('user_id', args.user_id).eq('status', 'active')
			)
			.collect();

		for (const sub of existingSubscriptions) {
			await ctx.db.patch(sub._id, { status: 'cancelled' });
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

		return { success: true, subscription_id: subscriptionId };
	},
});

/**
 * Cancel a user's subscription (admin only)
 */
export const cancelUserSubscription = mutation({
	args: {
		session_token: v.string(),
		subscription_id: v.id('subscriptions'),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Not authenticated');
		}

		const s = session as SessionObj;

		// Check if user is admin
		const adminCheck = await isAdmin(ctx, s.userId);
		if (!adminCheck) {
			throw new Error('Not authorized - admin access required');
		}

		const subscription = await ctx.db.get(args.subscription_id);
		if (!subscription) {
			throw new Error('Subscription not found');
		}

		await ctx.db.patch(args.subscription_id, {
			status: 'cancelled',
			notes: args.notes || subscription.notes,
		});

		return { success: true };
	},
});

/**
 * Extend a user's subscription (admin only)
 */
export const extendUserSubscription = mutation({
	args: {
		session_token: v.string(),
		subscription_id: v.id('subscriptions'),
		additional_days: v.number(),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			throw new Error('Not authenticated');
		}

		const s = session as SessionObj;

		// Check if user is admin
		const adminCheck = await isAdmin(ctx, s.userId);
		if (!adminCheck) {
			throw new Error('Not authorized - admin access required');
		}

		const subscription = await ctx.db.get(args.subscription_id);
		if (!subscription) {
			throw new Error('Subscription not found');
		}

		const newEndDate = subscription.end_date + args.additional_days * 24 * 60 * 60 * 1000;

		await ctx.db.patch(args.subscription_id, {
			end_date: newEndDate,
			notes: args.notes || subscription.notes,
		});

		return { success: true, new_end_date: newEndDate };
	},
});

/**
 * Check if current user is admin
 */
export const checkIsAdmin = query({
	args: {
		session_token: v.string(),
	},
	handler: async (ctx, args) => {
		const session = await ctx.runQuery(internal.betterAuth.getSession, {
			sessionToken: args.session_token,
		});

		if (!session) {
			return false;
		}

		const s = session as SessionObj;

		return await isAdmin(ctx, s.userId);
	},
});
