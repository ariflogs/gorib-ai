<script lang="ts">
	import { goto } from '$app/navigation';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { api } from '$lib/backend/convex/_generated/api';
	import { session } from '$lib/state/session.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		getPlanDisplayName,
		getPlanPrice,
		formatSubscriptionEndDate,
		getDaysRemaining,
		isExpiringSoon,
	} from '$lib/utils/subscription';
	import CheckCircleIcon from '~icons/lucide/check-circle';
	import ArrowUpIcon from '~icons/lucide/arrow-up';
	import CalendarIcon from '~icons/lucide/calendar';
	import CrownIcon from '~icons/lucide/crown';
	import CheckIcon from '~icons/lucide/check';
	import AnthropicIcon from '~icons/simple-icons/anthropic';
	import GoogleIcon from '~icons/simple-icons/google';
	import OpenAIIcon from '~icons/simple-icons/openai';

	const planInfo = useCachedQuery(api.subscriptions.getUserPlanInfo, {
		session_token: session.current?.session.token ?? '',
	});

	$: plan = planInfo.data?.plan || 'free';
	$: status = planInfo.data?.status || 'expired';
	$: endDate = planInfo.data?.end_date;
	$: daysLeft = endDate ? getDaysRemaining(endDate) : 0;
	$: expiringSoon = endDate ? isExpiringSoon(endDate) : false;

	const plans = [
		{
			id: 'basic',
			name: 'Basic Plan',
			price: 500,
			description: 'Perfect for everyday AI tasks',
			models: [
				{ icon: OpenAIIcon, name: 'GPT-5 mini', color: 'emerald' },
				{ icon: GoogleIcon, name: 'Gemini 2.5 Flash', color: 'blue' },
				{ icon: null, name: 'DeepSeek V3', color: 'purple', badge: 'DS' },
				{ icon: AnthropicIcon, name: 'Claude Haiku 4.5', color: 'orange' }
			]
		},
		{
			id: 'pro',
			name: 'Pro Plan',
			price: 1000,
			description: 'Everything in Basic, plus advanced models',
			popular: true,
			models: [
				{ icon: OpenAIIcon, name: 'GPT-5.4', color: 'emerald' },
				{ icon: AnthropicIcon, name: 'Claude Sonnet 4.6', color: 'orange' },
				{ icon: GoogleIcon, name: 'Gemini 3.1 Pro', color: 'blue' },
				{ icon: OpenAIIcon, name: 'GPT Image 1.5', color: 'emerald' },
				{ icon: null, name: 'Nano banana', color: 'yellow', badge: 'NB' }
			],
			note: 'All Basic models included'
		}
	];

	function selectPlan(planId: string) {
		goto(`/select-plan/${planId}`);
	}
</script>

<svelte:head>
	<title>Plan | gorib ai</title>
</svelte:head>

<h1 class="text-2xl font-bold">Subscription Plan</h1>
<h2 class="text-muted-foreground mt-2 text-sm">Manage your subscription and billing.</h2>

<div class="mt-8">
	{#if planInfo.data}
		<!-- Free Plan -->
		{#if plan === 'free'}
			<div class="mb-6">
				<Card class="p-4 bg-muted/50">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-semibold">Current Plan: {getPlanDisplayName(plan)}</h3>
							<p class="text-sm text-muted-foreground">
								Bring your own API keys to use premium models
							</p>
						</div>
						<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
							Free
						</span>
					</div>
				</Card>
			</div>

			<!-- Premium Plans -->
			<div class="space-y-6">
				<div>
					<h3 class="text-lg font-semibold mb-2">Upgrade to Premium</h3>
					<p class="text-sm text-muted-foreground">
						Unlock access to premium AI models without needing your own API keys.
					</p>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{#each plans as planOption}
						<Card class="relative {planOption.popular ? 'border-2 border-primary shadow-lg bg-gradient-to-br from-card to-primary/5' : ''}">
							{#if planOption.popular}
								<div class="absolute -top-3 left-1/2 -translate-x-1/2">
									<span class="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
										Most Popular
									</span>
								</div>
							{/if}

							<div class="p-6 space-y-4">
								<!-- Plan Header -->
								<div class="space-y-2">
									<h4 class="text-xl font-bold">{planOption.name}</h4>
									<div class="flex items-baseline gap-2">
										<span class="text-4xl font-bold text-primary">৳{planOption.price}</span>
										<span class="text-muted-foreground">/month</span>
									</div>
									<p class="text-sm text-muted-foreground">{planOption.description}</p>
								</div>

								<!-- Models List -->
								<div class="space-y-3 pt-4 border-t">
									{#if planOption.note}
										<p class="text-xs font-semibold text-foreground">{planOption.note}, plus:</p>
									{:else}
										<p class="text-xs font-semibold text-foreground">Included models:</p>
									{/if}

									<div class="space-y-2">
										{#each planOption.models as model}
											<div class="flex items-center gap-2">
												{#if model.icon}
													<div class="p-1.5 bg-{model.color}-500/10 rounded">
														<svelte:component this={model.icon} class="size-4 text-{model.color}-500" />
													</div>
												{:else}
													<div class="p-1.5 bg-{model.color}-500/10 rounded">
														<span class="size-4 text-{model.color}-500 font-bold text-[10px] flex items-center justify-center">
															{model.badge}
														</span>
													</div>
												{/if}
												<p class="text-sm font-medium">{model.name}</p>
											</div>
										{/each}
									</div>
								</div>

								<!-- CTA Button -->
								<Button
									class="w-full"
									variant={planOption.popular ? 'default' : 'outline'}
									onclick={() => selectPlan(planOption.id)}
								>
									Select {planOption.name}
								</Button>
							</div>
						</Card>
					{/each}
				</div>

				<!-- Additional Info -->
				<div class="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4">
					<div class="flex items-center gap-1.5">
						<CheckIcon class="size-3 text-primary" />
						<span>No credit card required</span>
					</div>
					<div class="flex items-center gap-1.5">
						<CheckIcon class="size-3 text-primary" />
						<span>Pay with bKash</span>
					</div>
					<div class="flex items-center gap-1.5">
						<CheckIcon class="size-3 text-primary" />
						<span>Cancel anytime</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Basic Plan -->
		{#if plan === 'basic' && status === 'active'}
			<Card class="p-6 border-2 border-blue-200 dark:border-blue-800">
				<div class="space-y-6">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="text-xl font-bold">{getPlanDisplayName(plan)}</h3>
							<div class="flex items-baseline gap-2 mt-2">
								<span class="text-2xl font-bold text-primary">৳{getPlanPrice(plan)}</span>
								<span class="text-muted-foreground text-sm">/month</span>
							</div>
						</div>
						<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
							Active
						</span>
					</div>

					{#if endDate}
						<div class="bg-muted/50 rounded-lg p-4 space-y-3">
							<div class="flex items-center gap-2 text-sm">
								<CalendarIcon class="size-4 text-muted-foreground" />
								<span class="text-muted-foreground">Expires on:</span>
								<span class="font-medium">{formatSubscriptionEndDate(endDate)}</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<span class="text-muted-foreground">Days remaining:</span>
								<span class="font-medium" class:text-orange-600={expiringSoon}>
									{daysLeft} {daysLeft === 1 ? 'day' : 'days'}
								</span>
							</div>
						</div>

						{#if expiringSoon}
							<div class="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
								<p class="text-sm text-orange-800 dark:text-orange-200">
									Your subscription is expiring soon! Renew to continue enjoying premium models.
								</p>
							</div>
						{/if}
					{/if}

					<!-- Available Models -->
					{#if planInfo.data.allowed_models && planInfo.data.allowed_models.length > 0}
						<div class="border-t pt-6 space-y-3">
							<p class="text-sm font-semibold">Available Models:</p>
							<div class="flex flex-wrap gap-2">
								{#each planInfo.data.allowed_models as modelId}
									<span class="inline-flex items-center px-2 py-1 rounded border border-border bg-background text-xs font-mono">
										{modelId}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Upgrade CTA -->
					<div class="border-t pt-6">
						<p class="text-sm text-muted-foreground mb-4">
							Want access to more advanced models like GPT-5.4 and Claude Sonnet 4.6?
						</p>
						<Button href="/select-plan/pro" class="w-full">
							<ArrowUpIcon class="size-4 mr-2" />
							Upgrade to Pro
						</Button>
					</div>
				</div>
			</Card>
		{/if}

		<!-- Pro Plan -->
		{#if plan === 'pro' && status === 'active'}
			<Card class="p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-card to-purple-50/50 dark:to-purple-950/20">
				<div class="space-y-6">
					<div class="flex items-start justify-between">
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-xl font-bold">{getPlanDisplayName(plan)}</h3>
								<CrownIcon class="size-5 text-purple-600" />
							</div>
							<div class="flex items-baseline gap-2 mt-2">
								<span class="text-2xl font-bold text-primary">৳{getPlanPrice(plan)}</span>
								<span class="text-muted-foreground text-sm">/month</span>
							</div>
						</div>
						<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
							Active
						</span>
					</div>

					{#if endDate}
						<div class="bg-muted/50 rounded-lg p-4 space-y-3">
							<div class="flex items-center gap-2 text-sm">
								<CalendarIcon class="size-4 text-muted-foreground" />
								<span class="text-muted-foreground">Expires on:</span>
								<span class="font-medium">{formatSubscriptionEndDate(endDate)}</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<span class="text-muted-foreground">Days remaining:</span>
								<span class="font-medium" class:text-orange-600={expiringSoon}>
									{daysLeft} {daysLeft === 1 ? 'day' : 'days'}
								</span>
							</div>
						</div>

						{#if expiringSoon}
							<div class="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
								<p class="text-sm text-orange-800 dark:text-orange-200">
									Your subscription is expiring soon! Renew to continue enjoying premium models.
								</p>
							</div>
						{/if}
					{/if}

					<!-- Available Models -->
					{#if planInfo.data.allowed_models && planInfo.data.allowed_models.length > 0}
						<div class="border-t pt-6 space-y-3">
							<p class="text-sm font-semibold">Available Models:</p>
							<div class="flex flex-wrap gap-2">
								{#each planInfo.data.allowed_models as modelId}
									<span class="inline-flex items-center px-2 py-1 rounded border border-border bg-background text-xs font-mono">
										{modelId}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Success message -->
					<div class="border-t pt-6">
						<div class="flex items-start gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
							<CheckCircleIcon class="size-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
							<p class="text-sm text-green-900 dark:text-green-100">
								You have access to all premium models including GPT-5.4, Claude Sonnet 4.6, and more.
							</p>
						</div>
					</div>
				</div>
			</Card>
		{/if}

		<!-- Expired/Cancelled Subscription -->
		{#if (plan === 'basic' || plan === 'pro') && (status === 'expired' || status === 'cancelled')}
			<Card class="p-6 border-2 border-red-200 dark:border-red-800">
				<div class="space-y-6">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="text-xl font-bold">{getPlanDisplayName(plan)}</h3>
							<p class="text-sm text-muted-foreground mt-1">
								Your subscription has {status === 'expired' ? 'expired' : 'been cancelled'}
							</p>
						</div>
						<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
							{status === 'expired' ? 'Expired' : 'Cancelled'}
						</span>
					</div>

					<div class="border-t pt-6">
						<p class="text-sm text-muted-foreground mb-4">
							Renew your subscription to continue accessing premium AI models.
						</p>
						<Button href="/select-plan" class="w-full">
							Renew Subscription
						</Button>
					</div>
				</div>
			</Card>
		{/if}
	{:else}
		<Card class="p-6">
			<div class="text-center text-muted-foreground">
				Loading subscription info...
			</div>
		</Card>
	{/if}
</div>
