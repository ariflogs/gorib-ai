<script lang="ts">
	import { api } from '$lib/backend/convex/_generated/api';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Search } from '$lib/components/ui/search';
	import { session } from '$lib/state/session.svelte';
	import { getAllModelsWithPlanInfo, type ModelWithPlan } from '$lib/utils/models';
	import { cn } from '$lib/utils/utils';
	import { Toggle } from 'melt/builders';
	import PlusIcon from '~icons/lucide/plus';
	import XIcon from '~icons/lucide/x';
	import LockIcon from '~icons/lucide/lock';
	import CrownIcon from '~icons/lucide/crown';
	import SparklesIcon from '~icons/lucide/sparkles';
	import CheckIcon from '~icons/lucide/check';
	import * as Card from '$lib/components/ui/card';

	const planInfo = useCachedQuery(api.subscriptions.getUserPlanInfo, {
		session_token: session.current?.session.token ?? '',
	});

	const userPlan = $derived(planInfo.data?.plan ?? 'free');
	const allModels = $derived(getAllModelsWithPlanInfo(userPlan));

	let search = $state('');

	const premiumToggle = new Toggle({
		value: false,
	});

	const imageModelsToggle = new Toggle({
		value: false,
	});

	const accessibleOnlyToggle = new Toggle({
		value: false,
	});

	const filteredModels = $derived(
		allModels.filter((m) => {
			// Search filter
			if (search) {
				const searchLower = search.toLowerCase();
				if (!m.name.toLowerCase().includes(searchLower) && !m.id.toLowerCase().includes(searchLower)) {
					return false;
				}
			}

			// Premium filter
			if (premiumToggle.value) {
				if (!m.tags.includes('premium')) return false;
			}

			// Image models filter
			if (imageModelsToggle.value) {
				if (!m.isImageModel) return false;
			}

			// Accessible only filter
			if (accessibleOnlyToggle.value) {
				if (m.requiresUpgrade) return false;
			}

			return true;
		}).sort((a, b) => {
			// Sort: accessible first, then by plan tier
			if (!a.requiresUpgrade && b.requiresUpgrade) return -1;
			if (a.requiresUpgrade && !b.requiresUpgrade) return 1;
			return 0;
		})
	);

	function getPlanBadgeColor(plan: string): string {
		if (plan === 'pro') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
		if (plan === 'basic') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
		return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
	}

	function formatPlanName(plan: string): string {
		return plan.charAt(0).toUpperCase() + plan.slice(1);
	}
</script>

<svelte:head>
	<title>Models | gorib ai</title>
</svelte:head>

<h1 class="text-2xl font-bold">Available Models</h1>
<h2 class="text-muted-foreground mt-2 text-sm">
	Browse all models available in your subscription plan. All models are accessible in the chat interface based on your plan.
</h2>

<div class="mt-4 flex flex-col gap-2">
	<Search bind:value={search} placeholder="Search models" />
	<div class="flex flex-wrap place-items-center gap-2">
		<button
			{...premiumToggle.trigger}
			aria-label="Premium Models"
			class="group bg-primary aria-[pressed=false]:border-border border-primary aria-[pressed=false]:bg-background aria-[pressed=true]:text-white flex place-items-center gap-1 rounded-full border px-2 py-1 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-50"
		>
			Premium
			<XIcon class="inline size-3 group-aria-[pressed=false]:hidden" />
			<PlusIcon class="inline size-3 group-aria-[pressed=true]:hidden" />
		</button>
		<button
			{...imageModelsToggle.trigger}
			aria-label="Image Models"
			class="group bg-primary aria-[pressed=false]:border-border border-primary aria-[pressed=false]:bg-background aria-[pressed=true]:text-white flex place-items-center gap-1 rounded-full border px-2 py-1 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-50"
		>
			Images
			<XIcon class="inline size-3 group-aria-[pressed=false]:hidden" />
			<PlusIcon class="inline size-3 group-aria-[pressed=true]:hidden" />
		</button>
		<button
			{...accessibleOnlyToggle.trigger}
			aria-label="Accessible Models Only"
			class="group bg-primary aria-[pressed=false]:border-border border-primary aria-[pressed=false]:bg-background aria-[pressed=true]:text-white flex place-items-center gap-1 rounded-full border px-2 py-1 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-50"
		>
			Accessible Only
			<XIcon class="inline size-3 group-aria-[pressed=false]:hidden" />
			<PlusIcon class="inline size-3 group-aria-[pressed=true]:hidden" />
		</button>
	</div>
	<div class="mt-2 flex items-center gap-2 text-sm">
		<span class="text-muted-foreground">Current Plan:</span>
		<span class="rounded-md border px-2 py-1 font-medium {getPlanBadgeColor(userPlan)}">
			{formatPlanName(userPlan)}
		</span>
		{#if userPlan === 'free'}
			<Button href="/select-plan" size="sm" variant="outline" class="ml-2 h-7 text-xs">
				Upgrade to Access Models
			</Button>
		{/if}
	</div>
</div>

{#if filteredModels.length > 0}
	<div class="mt-6 grid gap-4 md:grid-cols-2">
		{#each filteredModels as model (model.id)}
			<Card.Root>
				<Card.Header>
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<Card.Title class="text-base">{model.name}</Card.Title>
								{#if model.tags.includes('premium')}
									<CrownIcon class="size-4 text-amber-400" />
								{:else if model.tags.includes('recommended')}
									<SparklesIcon class="size-4 text-blue-400" />
								{/if}
							</div>
							<Card.Description class="mt-1 text-xs">{model.id}</Card.Description>
						</div>
						{#if model.requiresUpgrade}
							<div class="flex items-center gap-1 rounded-md border px-2 py-1 text-xs {getPlanBadgeColor(model.lowestPlan)}">
								<LockIcon class="size-3" />
								<span class="capitalize">{model.lowestPlan}</span>
							</div>
						{:else}
							<div class="flex items-center gap-1 rounded-md border bg-green-500/20 text-green-400 border-green-500/30 px-2 py-1 text-xs">
								<CheckIcon class="size-3" />
								<span>Included</span>
							</div>
						{/if}
					</div>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						<div class="flex flex-wrap gap-1">
							{#each model.tags as tag}
								<span class="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs">
									{tag}
								</span>
							{/each}
						</div>
						<div class="grid grid-cols-2 gap-3 text-xs">
							<div>
								<div class="text-muted-foreground mb-1">Provider</div>
								<div class="font-medium">{model.provider}</div>
							</div>
							<div>
								<div class="text-muted-foreground mb-1">Type</div>
								<div class="font-medium">{model.isImageModel ? 'Image Generation' : 'Chat'}</div>
							</div>
						</div>
						<!-- <div class="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3 text-xs">
							<div>
								<div class="text-muted-foreground mb-1">Daily Limit</div>
								<div class="font-medium">{model.dailyLimit} {model.isImageModel ? 'images' : 'messages'}</div>
							</div>
							<div>
								<div class="text-muted-foreground mb-1">Monthly Limit</div>
								<div class="font-medium">{model.monthlyLimit} {model.isImageModel ? 'images' : 'messages'}</div>
							</div>
						</div> -->
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
{:else}
	<div class="mt-6 rounded-lg border bg-muted/30 p-8 text-center">
		<p class="text-muted-foreground">No models found matching your filters.</p>
	</div>
{/if}
