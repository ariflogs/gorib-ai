import { PLANS } from '$lib/config';

export type PlanType = 'starter' | 'pro' | 'basic' | 'free';
export type ModelType = 'chat' | 'image';

export interface ModelLimits {
	dailyLimit?: number;
	monthlyLimit?: number;
	exists: boolean;
}

export interface PlanLimits {
	totalDailyChatLimit: number;
	totalMonthlyChatLimit: number;
	totalDailyImageLimit: number;
	totalMonthlyImageLimit: number;
	models: {
		chat: Array<any>;
		image: Array<any>;
	};
}

export function getPlanLimits(planType: PlanType): PlanLimits | null {
	if (planType === 'starter' || planType === 'pro') {
		return PLANS[planType];
	}
	// Free and basic plans don't have defined limits yet
	return null;
}

export function getModelLimit(
	planType: PlanType,
	modelId: string,
	modelType: ModelType
): ModelLimits {
	const plan = getPlanLimits(planType);

	if (!plan) {
		return { exists: false };
	}

	const model = plan.models[modelType].find((m) => m.id === modelId);

	return {
		dailyLimit: model?.dailyLimit,
		monthlyLimit: model?.monthlyLimit,
		exists: !!model
	};
}

export function getOverallLimits(planType: PlanType, modelType: ModelType) {
	const plan = getPlanLimits(planType);

	if (!plan) {
		return { dailyLimit: 0, monthlyLimit: 0 };
	}

	if (modelType === 'chat') {
		return {
			dailyLimit: plan.totalDailyChatLimit,
			monthlyLimit: plan.totalMonthlyChatLimit
		};
	} else {
		return {
			dailyLimit: plan.totalDailyImageLimit,
			monthlyLimit: plan.totalMonthlyImageLimit
		};
	}
}
