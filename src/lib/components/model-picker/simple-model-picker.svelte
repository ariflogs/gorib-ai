<script lang="ts">
	import { api } from '$lib/backend/convex/_generated/api';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { session } from '$lib/state/session.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import { getAllModelsWithPlanInfo, type ModelWithPlan } from '$lib/utils/models';
	import * as Popover from '$lib/components/ui/popover';
	import { Command } from 'bits-ui';
	import { cn } from '$lib/utils/utils';
	import ChevronDownIcon from '~icons/lucide/chevron-down';
	import SearchIcon from '~icons/lucide/search';
	import LockIcon from '~icons/lucide/lock';
	import CrownIcon from '~icons/lucide/crown';
	import SparklesIcon from '~icons/lucide/sparkles';

	type Props = {
		class?: string;
		onlyImageModels?: boolean;
	};

	let { class: className, onlyImageModels }: Props = $props();

	const planInfo = useCachedQuery(api.subscriptions.getUserPlanInfo, {
		session_token: session.current?.session.token ?? '',
	});

	const userPlan = $derived(planInfo.data?.plan ?? 'free');
	const allModels = $derived(getAllModelsWithPlanInfo(userPlan));
	const displayModels = $derived(
		onlyImageModels
			? allModels.filter(m => m.isImageModel)
			: allModels.filter(m => !m.isImageModel)
	);

	let search = $state('');
	let open = $state(false);

	const filteredModels = $derived(
		displayModels.filter((m) =>
			m.name.toLowerCase().includes(search.toLowerCase()) ||
			m.id.toLowerCase().includes(search.toLowerCase())
		)
	);

	const currentModel = $derived(
		displayModels.find((m) => m.id === settings.modelId)
	);

	// Set default model based on user's plan
	$effect(() => {
		// Wait for plan data to load
		if (!planInfo.data || planInfo.isLoading) return;

		// Check if we need to set a default: either no model selected, or current model not in displayModels
		const needsDefault = !settings.modelId || !displayModels.find(m => m.id === settings.modelId);

		if (needsDefault && displayModels.length > 0 && userPlan !== 'free') {
			let defaultModel;

			if (userPlan === 'basic') {
				// Default to DeepSeek V3.2 for basic plan
				defaultModel = displayModels.find(m => m.id === 'deepseek-v3.2' && !m.requiresUpgrade);
			} else if (userPlan === 'pro') {
				// Default to Gemini 3.1 Flash Lite for pro plan
				defaultModel = displayModels.find(m => m.id === 'gemini-3.1-flash-lite-preview' && !m.requiresUpgrade);
			}

			// Fall back to first accessible model if plan-specific default not found
			if (!defaultModel) {
				defaultModel = displayModels.find(m => !m.requiresUpgrade);
			}

			if (defaultModel) {
				settings.modelId = defaultModel.id;
			}
		}
	});

	function selectModel(model: ModelWithPlan) {
		if (model.requiresUpgrade) {
			// Don't allow selection of upgraded models
			return;
		}
		settings.modelId = model.id;
		open = false;
	}

	function getPlanBadgeColor(plan: string): string {
		if (plan === 'pro') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
		if (plan === 'basic') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
		return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class={cn(
			'ring-offset-background focus:ring-ring flex items-center justify-between rounded-lg px-2 py-1 text-xs transition hover:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
	>
		<div class="flex items-center gap-2 pr-2">
			{#if currentModel}
				<span class="truncate">{currentModel.name}</span>
			{:else}
				<span class="truncate">Select model</span>
			{/if}
		</div>
		<ChevronDownIcon class="size-4 opacity-50" />
	</Popover.Trigger>

	<Popover.Content align="start" sideOffset={5} class="w-[400px] p-0">
		<Command.Root class="flex h-full w-full flex-col overflow-hidden">
			<label class="border-border relative flex items-center gap-2 border-b px-4 py-3 text-sm">
				<SearchIcon class="text-muted-foreground" />
				<Command.Input
					bind:value={search}
					class="w-full outline-none"
					placeholder="Search models..."
				/>
			</label>

			<Command.List class="max-h-[400px] overflow-y-auto p-2">
				{#if filteredModels.length === 0}
					<div class="text-muted-foreground py-6 text-center text-sm">
						No models found
					</div>
				{:else}
					<div class="flex flex-col gap-1">
						{#each filteredModels as model (model.id)}
							<Command.Item
								value={model.id}
								class={cn(
									'flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors',
									'hover:bg-accent/50',
									model.requiresUpgrade && 'opacity-60 cursor-not-allowed',
									settings.modelId === model.id && 'bg-accent'
								)}
								onSelect={() => selectModel(model)}
								disabled={model.requiresUpgrade}
							>
								<div class="flex flex-col gap-1">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium">{model.name}</span>
										{#if model.tags.includes('premium')}
											<CrownIcon class="size-3 text-amber-400" />
										{:else if model.tags.includes('recommended')}
											<SparklesIcon class="size-3 text-blue-400" />
										{/if}
									</div>
									<div class="flex items-center gap-2">
										{#each model.tags as tag}
											<span class="rounded border border-primary/30 bg-primary/20 px-1 py-0.5 text-xs">{tag}</span>
										{/each}
									</div>
								</div>

								<div class="flex items-center gap-2">
									{#if model.requiresUpgrade}
										<div class="flex items-center gap-1 rounded-md border px-2 py-1 {getPlanBadgeColor(model.lowestPlan)}">
											<LockIcon class="size-3" />
											<span class="text-xs capitalize">{model.lowestPlan}</span>
										</div>
									{:else}
										<div class="flex items-center gap-1 rounded-md border px-2 py-1 bg-green-500/20 text-green-400 border-green-500/30">
											<span class="text-xs">Included</span>
										</div>
									{/if}
								</div>
							</Command.Item>
						{/each}
					</div>
				{/if}
			</Command.List>

			{#if userPlan === 'free'}
				<div class="border-border border-t p-3 text-center">
					<p class="text-muted-foreground text-xs">
						Subscribe to access AI models
					</p>
					<a
						href="/select-plan"
						class="text-primary mt-2 inline-block text-sm font-medium hover:underline"
					>
						View Plans
					</a>
				</div>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>
