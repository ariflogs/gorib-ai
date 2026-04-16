import type { SubscriptionPlan } from '$lib/backend/convex/schema';

/**
 * Model IDs for each subscription tier
 */
export const SUBSCRIPTION_MODELS = {
	free: [] as string[],
	basic: ['gpt-5-mini', 'gemini-2.5-flash', 'deepseek-v3', 'claude-haiku-4.5'],
	pro: [
		'gpt-5-mini',
		'gemini-2.5-flash',
		'deepseek-v3',
		'claude-haiku-4.5',
		'gpt-5.4',
		'claude-sonnet-4.6',
		'gemini-3.1-pro',
		'gpt-image-1.5',
		'nano-banana',
	],
} as const;

/**
 * Get display name for subscription plan
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
	const names: Record<SubscriptionPlan, string> = {
		free: 'Free',
		basic: 'Basic Plan',
		pro: 'Pro Plan',
	};
	return names[plan];
}

/**
 * Get price for subscription plan (in BDT)
 */
export function getPlanPrice(plan: SubscriptionPlan): number {
	const prices: Record<SubscriptionPlan, number> = {
		free: 0,
		basic: 500,
		pro: 1000,
	};
	return prices[plan];
}

/**
 * Check if a model is available in a plan
 */
export function isModelAvailableInPlan(modelId: string, plan: SubscriptionPlan): boolean {
	return SUBSCRIPTION_MODELS[plan].includes(modelId);
}

/**
 * Get all models available in a plan
 */
export function getAvailableModels(plan: SubscriptionPlan): string[] {
	return SUBSCRIPTION_MODELS[plan];
}

/**
 * Get the minimum plan required for a model
 */
export function getRequiredPlan(modelId: string): SubscriptionPlan {
	if (SUBSCRIPTION_MODELS.basic.includes(modelId)) {
		return 'basic';
	}
	if (SUBSCRIPTION_MODELS.pro.includes(modelId)) {
		return 'pro';
	}
	return 'free';
}

/**
 * Format subscription end date
 */
export function formatSubscriptionEndDate(endDate: number): string {
	const date = new Date(endDate);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

/**
 * Get days remaining in subscription
 */
export function getDaysRemaining(endDate: number): number {
	const now = Date.now();
	const diff = endDate - now;
	return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isExpiringSoon(endDate: number): boolean {
	const daysRemaining = getDaysRemaining(endDate);
	return daysRemaining > 0 && daysRemaining <= 7;
}

/**
 * Get subscription status color for UI
 */
export function getSubscriptionStatusColor(status: 'active' | 'expired' | 'cancelled'): string {
	const colors: Record<string, string> = {
		active: 'text-green-600',
		expired: 'text-red-600',
		cancelled: 'text-gray-600',
	};
	return colors[status] || 'text-gray-600';
}

/**
 * Get plan badge color for UI
 */
export function getPlanBadgeColor(plan: SubscriptionPlan): string {
	const colors: Record<SubscriptionPlan, string> = {
		free: 'bg-gray-100 text-gray-800',
		basic: 'bg-blue-100 text-blue-800',
		pro: 'bg-purple-100 text-purple-800',
	};
	return colors[plan];
}
