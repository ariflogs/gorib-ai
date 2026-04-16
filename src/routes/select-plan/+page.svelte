<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import CheckIcon from '~icons/lucide/check';
	import AnthropicIcon from '~icons/simple-icons/anthropic';
	import GoogleIcon from '~icons/simple-icons/google';
	import OpenAIIcon from '~icons/simple-icons/openai';

	const plans = [
		{
			id: 'basic',
			name: 'Basic Plan',
			price: 500,
			description: 'Perfect for everyday AI tasks',
			models: [
				{ icon: OpenAIIcon, name: 'GPT-5 mini', color: 'emerald' },
				{ icon: GoogleIcon, name: 'Gemini 2.5 Flash', color: 'blue' },
				{ icon: null, name: 'DeepSeek V3', color: 'blue', badge: 'DS' },
				{ icon: AnthropicIcon, name: 'Claude Haiku 4.5', color: 'orange' },
				{ icon: null, name: 'Kimi 2.5', color: 'purple', badge: 'KM' }
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
	<title>Select a Plan - GoribAI</title>
</svelte:head>

<div class="min-h-screen bg-muted/20 py-12 px-4">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold mb-4">
				Choose Your Plan
			</h1>
			<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
				Select a plan to unlock access to premium AI models. Pay easily with bKash.
			</p>
		</div>

		<!-- Plans Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
			{#each plans as plan}
				<Card class="relative {plan.popular ? 'border-2 border-primary shadow-xl bg-gradient-to-br from-card to-primary/5' : 'hover:shadow-xl transition-all duration-300'}">
					{#if plan.popular}
						<div class="absolute -top-4 left-1/2 -translate-x-1/2">
							<span class="bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
								Best Value
							</span>
						</div>
					{/if}

					<div class="p-6 space-y-6">
						<!-- Plan Header -->
						<div class="space-y-2">
							<h3 class="text-2xl font-bold">{plan.name}</h3>
							<div class="flex items-baseline gap-2">
								<span class="text-5xl font-bold text-primary">৳{plan.price}</span>
								<span class="text-muted-foreground">/month</span>
							</div>
							<p class="text-sm text-muted-foreground">{plan.description}</p>
						</div>

						<!-- Models List -->
						<div class="space-y-4 pt-4 border-t">
							{#if plan.note}
								<p class="text-sm font-semibold text-foreground">{plan.note}, plus:</p>
							{:else}
								<p class="text-sm font-semibold text-foreground">Included models:</p>
							{/if}

							<div class="space-y-3">
								{#each plan.models as model}
									<div class="flex items-center gap-3">
										{#if model.icon}
											<div class="p-2 bg-{model.color}-500/10 rounded-lg">
												<svelte:component this={model.icon} class="size-5 text-{model.color}-500" />
											</div>
										{:else}
											<div class="p-2 bg-{model.color}-500/10 rounded-lg">
												<span class="size-5 text-{model.color}-500 font-bold text-xs flex items-center justify-center">
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
							size="lg"
							variant={plan.popular ? 'default' : 'outline'}
							onclick={() => selectPlan(plan.id)}
						>
							Select {plan.name}
						</Button>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Additional Info -->
		<div class="mt-12 text-center space-y-4">
			<div class="flex items-center justify-center gap-6 text-sm text-muted-foreground">
				<div class="flex items-center gap-2">
					<CheckIcon class="size-4 text-primary" />
					<span>No credit card required</span>
				</div>
				<div class="flex items-center gap-2">
					<CheckIcon class="size-4 text-primary" />
					<span>Pay with bKash</span>
				</div>
				<div class="flex items-center gap-2">
					<CheckIcon class="size-4 text-primary" />
					<span>Cancel anytime</span>
				</div>
			</div>

			<p class="text-xs text-muted-foreground">
				* All plans are monthly subscriptions with unlimited usage
			</p>
		</div>
	</div>
</div>
