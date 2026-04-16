<script lang="ts">
	import { useQuery } from 'convex/react';
	import { api } from '$lib/backend/convex/_generated/api';
	import { session } from '$lib/state/session.svelte';
	import {
		getPlanDisplayName,
		getDaysRemaining,
		isExpiringSoon,
		formatSubscriptionEndDate,
		getPlanPrice
	} from '$lib/utils/subscription';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const sessionToken = session.current?.session?.token;

	const planInfo = useQuery(
		api.subscriptions.getUserPlanInfo,
		sessionToken ? { session_token: sessionToken } : 'skip'
	);

	$: plan = planInfo?.plan || 'free';
	$: status = planInfo?.status || 'expired';
	$: endDate = planInfo?.end_date;
	$: daysLeft = endDate ? getDaysRemaining(endDate) : 0;
	$: expiringSoon = endDate ? isExpiringSoon(endDate) : false;
</script>

{#if planInfo}
	<Card class="p-6">
		<div class="space-y-4">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-xl font-bold">{getPlanDisplayName(plan)}</h3>
					<p class="text-sm text-muted-foreground">
						{#if plan === 'free'}
							Bring your own API keys
						{:else}
							৳{getPlanPrice(plan)}/month
						{/if}
					</p>
				</div>

				{#if status === 'active'}
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
						Active
					</span>
				{:else if status === 'expired'}
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
						Expired
					</span>
				{:else}
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						Cancelled
					</span>
				{/if}
			</div>

			<!-- Subscription Details -->
			{#if plan !== 'free' && status === 'active' && endDate}
				<div class="pt-4 border-t space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Expires on:</span>
						<span class="font-medium">{formatSubscriptionEndDate(endDate)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Days remaining:</span>
						<span class="font-medium" class:text-orange-600={expiringSoon}>
							{daysLeft} {daysLeft === 1 ? 'day' : 'days'}
						</span>
					</div>
				</div>

				{#if expiringSoon}
					<div class="pt-4 border-t">
						<div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
							<p class="text-sm text-orange-800">
								Your subscription is expiring soon! Renew to continue enjoying premium models.
							</p>
						</div>
					</div>
				{/if}
			{/if}

			<!-- Upgrade CTA -->
			{#if plan === 'free' || status !== 'active'}
				<div class="pt-4 border-t">
					<Button class="w-full" href="/select-plan">
						{plan === 'free' ? 'Upgrade to Premium' : 'Renew Subscription'}
					</Button>
				</div>
			{/if}

			<!-- Available Models -->
			{#if planInfo.allowed_models && planInfo.allowed_models.length > 0}
				<div class="pt-4 border-t space-y-2">
					<p class="text-sm font-semibold text-muted-foreground">Available Models:</p>
					<div class="flex flex-wrap gap-2">
						{#each planInfo.allowed_models as modelId}
							<span class="inline-flex items-center px-2 py-1 rounded border border-border bg-background text-xs font-mono">
								{modelId}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</Card>
{:else}
	<Card class="p-6">
		<div class="text-center text-muted-foreground">
			Loading subscription info...
		</div>
	</Card>
{/if}
