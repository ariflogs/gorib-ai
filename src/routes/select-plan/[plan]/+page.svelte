<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { session } from '$lib/state/session.svelte';
	import ArrowLeftIcon from '~icons/lucide/arrow-left';
	import CheckCircleIcon from '~icons/lucide/check-circle';
	import PhoneIcon from '~icons/lucide/phone';
	import MailIcon from '~icons/lucide/mail';
	import ClockIcon from '~icons/lucide/clock';

	const planId = $page.params.plan;

	// Plan details
	const planDetails: Record<string, { name: string; price: number; description: string }> = {
		basic: {
			name: 'Basic Plan',
			price: 500,
			description: 'GPT-5 mini, Gemini 2.5 Flash, DeepSeek V3, Claude Haiku 4.5'
		},
		pro: {
			name: 'Pro Plan',
			price: 1000,
			description: 'All Basic models + GPT-5.4, Claude Sonnet 4.6, Gemini 3.1 Pro, GPT Image 1.5, Nano banana'
		}
	};

	const currentPlan = planDetails[planId];

	// Get user email from session
	const userEmail = session.current?.user?.email || 'your-email@example.com';

	// Redirect if invalid plan
	if (!currentPlan) {
		goto('/select-plan');
	}

	const bkashNumber = '01309055097';
	const whatsappNumber = '01309055097';

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		alert('Copied to clipboard!');
	}
</script>

<svelte:head>
	<title>Subscribe to {currentPlan?.name} - GoribAI</title>
</svelte:head>

{#if currentPlan}
	<div class="min-h-screen bg-muted/20 py-12 px-4">
		<div class="max-w-4xl mx-auto">
			<!-- Back Button -->
			<Button variant="ghost" class="mb-6" on:click={() => goto('/select-plan')}>
				<ArrowLeftIcon class="size-4 mr-2" />
				Back to Plans
			</Button>

			<!-- Header -->
			<div class="text-center mb-8">
				<div class="inline-block mb-4 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
					Step-by-step guide
				</div>
				<h1 class="text-4xl md:text-5xl font-bold mb-4">
					Subscribe to {currentPlan.name}
				</h1>
				<div class="flex items-baseline justify-center gap-2 mb-2">
					<span class="text-3xl font-bold text-primary">৳{currentPlan.price}</span>
					<span class="text-muted-foreground">/month</span>
				</div>
				<p class="text-muted-foreground">{currentPlan.description}</p>
			</div>

			<!-- Payment Instructions -->
			<Card class="p-8 mb-6">
				<div class="space-y-6">
					<div class="flex items-center gap-3 pb-4 border-b">
						<div class="p-3 bg-pink-500/10 rounded-lg">
							<span class="font-bold text-2xl text-pink-600">bKash</span>
						</div>
						<div>
							<h2 class="text-2xl font-bold">Payment Instructions</h2>
							<p class="text-sm text-muted-foreground">Follow these steps to complete your subscription</p>
						</div>
					</div>

					<!-- Steps -->
					<div class="space-y-6">
						<!-- Step 1 -->
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									1
								</div>
							</div>
							<div class="flex-1 pt-1">
								<h3 class="font-semibold text-lg mb-2">Open bKash App</h3>
								<p class="text-muted-foreground">From your bKash app, go to the "Send Money" option</p>
							</div>
						</div>

						<!-- Step 2 -->
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									2
								</div>
							</div>
							<div class="flex-1 pt-1">
								<h3 class="font-semibold text-lg mb-2">Send Money</h3>
								<p class="text-muted-foreground mb-3">
									Send <span class="font-bold text-primary text-xl">৳{currentPlan.price}</span> to the following number:
								</p>
								<div class="flex items-center gap-3 bg-muted/50 p-4 rounded-lg border">
									<PhoneIcon class="size-5 text-primary" />
									<span class="text-2xl font-bold font-mono">{bkashNumber}</span>
									<Button
										variant="outline"
										size="sm"
										class="ml-auto"
										on:click={() => copyToClipboard(bkashNumber)}
									>
										Copy
									</Button>
								</div>
							</div>
						</div>

						<!-- Step 3 -->
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									3
								</div>
							</div>
							<div class="flex-1 pt-1">
								<h3 class="font-semibold text-lg mb-2">Add Reference</h3>
								<p class="text-muted-foreground mb-3">
									In the reference field, mention your email address that you used to create your account:
								</p>
								<div class="flex items-center gap-3 bg-muted/50 p-4 rounded-lg border">
									<MailIcon class="size-5 text-primary" />
									<span class="text-lg font-mono break-all">{userEmail}</span>
									<Button
										variant="outline"
										size="sm"
										class="ml-auto flex-shrink-0"
										on:click={() => copyToClipboard(userEmail)}
									>
										Copy
									</Button>
								</div>
								<p class="text-xs text-muted-foreground mt-2">
									This helps us verify your payment quickly
								</p>
							</div>
						</div>

						<!-- Step 4 -->
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									4
								</div>
							</div>
							<div class="flex-1 pt-1">
								<h3 class="font-semibold text-lg mb-2">Wait for Activation</h3>
								<div class="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
									<ClockIcon class="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
									<div>
										<p class="text-sm text-blue-900 dark:text-blue-100">
											After sending the payment, wait for a few hours. We will verify your payment and upgrade your account to <span class="font-semibold">{currentPlan.name}</span>.
										</p>
										<p class="text-sm text-blue-900 dark:text-blue-100 mt-2">
											You will receive a confirmation email once your subscription is activated.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>

			<!-- Support Card -->
			<Card class="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
				<div class="flex items-start gap-4">
					<div class="p-3 bg-orange-500/10 rounded-lg">
						<PhoneIcon class="size-6 text-orange-600 dark:text-orange-400" />
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-lg mb-2">Need Help?</h3>
						<p class="text-sm text-muted-foreground mb-4">
							If it's taking more than a few hours or you have any questions, please send me a message on WhatsApp:
						</p>
						<Button
							variant="default"
							class="bg-orange-600 hover:bg-orange-700"
							on:click={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
						>
							<PhoneIcon class="size-4 mr-2" />
							Contact on WhatsApp: {whatsappNumber}
						</Button>
					</div>
				</div>
			</Card>

			<!-- Summary -->
			<div class="mt-8 text-center space-y-4">
				<div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<CheckCircleIcon class="size-4 text-green-600" />
					<span>Secure payment via bKash</span>
				</div>
				<div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<CheckCircleIcon class="size-4 text-green-600" />
					<span>Manual verification within a few hours</span>
				</div>
				<div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<CheckCircleIcon class="size-4 text-green-600" />
					<span>Email notification on activation</span>
				</div>
			</div>
		</div>
	</div>
{/if}
