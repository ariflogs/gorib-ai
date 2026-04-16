# AI Chat Models Integration Plan

## Overview
Integrate all models from `src/lib/config.ts` into the chat interface, ensuring they're automatically enabled based on user subscriptions and properly displayed in the model picker.

## Current Architecture Analysis

### How Models Work Currently
1. **Model Fetching**: use src/lib/config.ts to get all available models
2. **Display**: Model picker shows all the models but if he's on base plan then diable the pro plan models
3. **Access Control**: `subscriptions.ts` has hardcoded `PLAN_MODELS` mapping

### Current Files
- `src/lib/config.ts` - Source of truth for plan models with limits, costs, providers
- `src/lib/backend/convex/subscriptions.ts` - Has `PLAN_MODELS` (outdated/incomplete)
- `src/lib/components/model-picker/model-picker.svelte` - Model selection dropdown
- `src/lib/backend/convex/rate_limiter.ts` - Uses config.ts for rate limits

### Problems Identified
1. **No Auto-Enable**: Subscribing to a plan doesn't auto-enable plan models
2. **OpenRouter Only**: System currently only fetches OpenRouter models dynamically

## Implementation Plan


### Phase 1: Change the user enabled models to generic config.ts models

we don't have the user enabled models feature anymore. so remove the user enabled models feature and use the config.ts models directly.


### Phase 3: Update Model Display Logic

**Goal**: Show plan models with badges/indicators in model picker

#### 3 Add Plan Info to Model Data


#### 4 Add Usage Indicator
based on how many messages he sent in a month, show an usage indicator/progress bar in account page

### Phase 5: Update Account Models Page

**Goal**: Show plan-based models with proper indicators

#### 5.1 Add Plan Filter
```svelte
<!-- src/routes/account/models/+page.svelte -->

<div class="flex gap-2">
	<button
		class="toggle-button"
		on:click={() => showOnlyPlanModels = !showOnlyPlanModels}
	>
		{showOnlyPlanModels ? 'Show All' : 'My Plan Models'}
	</button>
</div>
```

#### 5.2 Add Plan Badges
```svelte
<!-- In model card -->
{#if isInCurrentPlan(model.id)}
	<Badge variant="success">Included in Plan</Badge>
{:else if isInHigherPlan(model.id)}
	<Badge variant="secondary">Upgrade to Access</Badge>
{/if}
```
