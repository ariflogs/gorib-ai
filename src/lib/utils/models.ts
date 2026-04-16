import { PLANS } from '$lib/config';

export type PlanType = 'free' | 'basic' | 'pro';
export type ModelType = 'chat' | 'image';

export interface ConfigModel {
	id: string;
	name: string;
	provider: string;
	inputCost?: number;
	outputCost?: number;
	costPerImage?: number;
	dailyLimit: number;
	monthlyLimit: number;
	tags: string[];
}

export interface ModelWithPlan extends ConfigModel {
	availablePlans: PlanType[];
	requiresUpgrade: boolean;
	lowestPlan: PlanType;
	openRouterModelId: string;
	isImageModel: boolean;
}

// Map config model IDs to OpenRouter model IDs
const MODEL_ID_MAP: Record<string, string> = {
	'gpt-5.4-nano': 'openai/gpt-4o-mini',
	'gpt-5.4-mini': 'openai/gpt-4o-mini',
	'gpt-5.4': 'openai/gpt-4o',
	'gemini-3.1-flash-lite-preview': 'google/gemini-flash-1.5',
	'gemini-3.0-flash': 'google/gemini-flash-1.5',
	'gemini-3.1-pro': 'google/gemini-pro-1.5',
	'claude-haiku-4.5': 'anthropic/claude-3.5-haiku',
	'claude-sonnet-4.6': 'anthropic/claude-3.5-sonnet',
	'deepseek-v3.2': 'deepseek/deepseek-chat',
	'kimi-k2.5': 'moonshot/moonshot-v1-8k',
	'gpt-image-1-mini': 'openai/dall-e-3',
	'imagen-4-standard': 'google/imagen-3',
	'gpt-image-1.5': 'openai/dall-e-3',
	'nano-banana-pro': 'google/imagen-3',
};

/**
 * Get OpenRouter model ID from config model ID
 */
export function getOpenRouterModelId(configModelId: string): string {
	return MODEL_ID_MAP[configModelId] || configModelId;
}

/**
 * Check if a model is an image generation model
 */
export function isImageModel(model: ConfigModel): boolean {
	return model.tags.includes('image');
}

/**
 * Get all models from config for a specific plan
 */
export function getModelsForPlan(plan: PlanType): ConfigModel[] {
	if (plan === 'free') {
		return [];
	}

	return PLANS[plan].models;
}

/**
 * Get all unique models across all plans with plan information
 */
export function getAllModelsWithPlanInfo(userPlan: PlanType): ModelWithPlan[] {
	const allModels = new Map<string, ModelWithPlan>();

	// Collect all models from all plans
	(['basic', 'pro'] as const).forEach((plan) => {
		PLANS[plan].models.forEach((model: ConfigModel) => {
			if (!allModels.has(model.id)) {
				// First time seeing this model
				allModels.set(model.id, {
					...model,
					availablePlans: [plan],
					requiresUpgrade: getPlanTier(userPlan) < getPlanTier(plan),
					lowestPlan: plan,
					openRouterModelId: getOpenRouterModelId(model.id),
					isImageModel: isImageModel(model),
				});
			} else {
				// Model exists in multiple plans, update available plans
				const existing = allModels.get(model.id)!;
				existing.availablePlans.push(plan);

				// Update lowest plan if this plan is lower tier
				if (getPlanTier(plan) < getPlanTier(existing.lowestPlan)) {
					existing.lowestPlan = plan;
				}

				// Update requiresUpgrade based on user's plan
				existing.requiresUpgrade = getPlanTier(userPlan) < getPlanTier(existing.lowestPlan);

				// Use the higher plan's limits
				if (getPlanTier(plan) > getPlanTier(existing.lowestPlan)) {
					existing.dailyLimit = Math.max(existing.dailyLimit, model.dailyLimit);
					existing.monthlyLimit = Math.max(existing.monthlyLimit, model.monthlyLimit);
				}
			}
		});
	});

	return Array.from(allModels.values());
}

/**
 * Get numeric tier for plan comparison
 */
function getPlanTier(plan: PlanType): number {
	const tiers: Record<PlanType, number> = {
		free: 0,
		basic: 1,
		pro: 2,
	};
	return tiers[plan];
}

/**
 * Check if user can access a model based on their plan
 */
export function canAccessModel(userPlan: PlanType, modelId: string): boolean {
	if (userPlan === 'free') {
		return false;
	}

	const model = getAllModelsWithPlanInfo(userPlan).find((m) => m.id === modelId);
	return model ? !model.requiresUpgrade : false;
}

/**
 * Get models filtered by user's plan (only accessible models)
 */
export function getAccessibleModels(userPlan: PlanType): ModelWithPlan[] {
	return getAllModelsWithPlanInfo(userPlan).filter((m) => !m.requiresUpgrade);
}

/**
 * Get chat models only
 */
export function getChatModels(userPlan: PlanType): ModelWithPlan[] {
	return getAllModelsWithPlanInfo(userPlan).filter((m) => !m.isImageModel);
}

/**
 * Get image models only
 */
export function getImageModels(userPlan: PlanType): ModelWithPlan[] {
	return getAllModelsWithPlanInfo(userPlan).filter((m) => m.isImageModel);
}

/**
 * Get model by ID
 */
export function getModelById(modelId: string, userPlan: PlanType): ModelWithPlan | undefined {
	return getAllModelsWithPlanInfo(userPlan).find((m) => m.id === modelId);
}

/**
 * Get model limits for a specific plan
 */
export function getModelLimits(
	modelId: string,
	planType: PlanType
): { dailyLimit: number; monthlyLimit: number } | null {
	if (planType === 'free') {
		return null;
	}

	const planModels = PLANS[planType].models;
	const model = planModels.find((m: ConfigModel) => m.id === modelId);

	if (!model) {
		return null;
	}

	return {
		dailyLimit: model.dailyLimit,
		monthlyLimit: model.monthlyLimit,
	};
}
