<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import AnthropicIcon from '~icons/simple-icons/anthropic';
	import GoogleIcon from '~icons/simple-icons/google';
	import OpenAIIcon from '~icons/simple-icons/openai';
</script>

<section class="py-20 md:py-28 bg-muted/20">
	<div class="max-w-6xl mx-auto px-4 md:px-6">
		<div class="text-center mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-4">
				Simple Pricing
			</h2>
			<p class="text-lg text-muted-foreground">
				No hidden fees. Choose the plan that fits your needs.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
			<!-- Basic Plan - 500tk/month -->
			<Card class="relative hover:shadow-xl transition-all duration-300">
				<div class="flex flex-col h-full p-6">
					<div class="space-y-2 mb-6">
						<h3 class="text-2xl font-bold">Basic Plan</h3>
						<div class="flex items-baseline gap-2">
							<span class="text-5xl font-bold text-primary">৳500</span>
							<span class="text-muted-foreground">/month</span>
						</div>
						<p class="text-sm text-muted-foreground">Perfect for everyday AI tasks</p>
					</div>

					<div class="space-y-4 flex-1">
						<p class="text-sm font-semibold text-foreground">
							Included models:
						</p>

						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<div class="p-2 bg-emerald-500/10 rounded-lg">
									<OpenAIIcon class="size-5 text-emerald-500" />
								</div>
								<p class="text-sm font-medium">GPT-5 mini</p>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-2 bg-blue-500/10 rounded-lg">
									<GoogleIcon class="size-5 text-blue-500" />
								</div>
								<p class="text-sm font-medium">Gemini 2.5 Flash</p>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-2 bg-purple-500/10 rounded-lg">
									<span class="size-5 text-purple-500 font-bold text-xs flex items-center justify-center">DS</span>
								</div>
								<p class="text-sm font-medium">DeepSeek V3</p>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-2 bg-orange-500/10 rounded-lg">
									<AnthropicIcon class="size-5 text-orange-500" />
								</div>
								<p class="text-sm font-medium">Claude Haiku 4.5</p>
							</div>
						</div>
					</div>

					<Button class="w-full mt-6" size="lg" variant="outline" href="/select-plan/basic">
						Get Started
					</Button>
				</div>
			</Card>

			<!-- Pro Plan - 1000tk/month -->
			<Card class="relative border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-primary/5">
				<div class="absolute -top-4 left-1/2 -translate-x-1/2">
					<span class="bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
						Most Popular
					</span>
				</div>
				<div class="flex flex-col h-full p-6">
					<div class="space-y-2 mb-6">
						<h3 class="text-2xl font-bold">Pro Plan</h3>
						<div class="flex items-baseline gap-2">
							<span class="text-5xl font-bold text-primary">৳1,000</span>
							<span class="text-muted-foreground">/month</span>
						</div>
						<p class="text-sm text-muted-foreground">Everything in Basic, plus advanced models</p>
					</div>

					<div class="space-y-4 flex-1">
						<p class="text-sm font-semibold text-foreground">
							All Basic models, plus:
						</p>

						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<div class="p-2 bg-emerald-500/10 rounded-lg">
									<OpenAIIcon class="size-5 text-emerald-500" />
								</div>
								<p class="text-sm font-medium">GPT-5.4</p>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-2 bg-orange-500/10 rounded-lg">
									<AnthropicIcon class="size-5 text-orange-500" />
								</div>
								<p class="text-sm font-medium">Claude Sonnet 4.6</p>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-2 bg-blue-500/10 rounded-lg">
									<GoogleIcon class="size-5 text-blue-500" />
								</div>
								<p class="text-sm font-medium">Gemini 3.1 Pro</p>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-2 bg-emerald-500/10 rounded-lg">
									<OpenAIIcon class="size-5 text-emerald-500" />
								</div>
								<p class="text-sm font-medium">GPT Image 1.5</p>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-2 bg-yellow-500/10 rounded-lg">
									<span class="size-5 text-yellow-500 font-bold text-xs flex items-center justify-center">NB</span>
								</div>
								<p class="text-sm font-medium">Nano banana</p>
							</div>
						</div>
					</div>

					<Button class="w-full mt-6" size="lg" href="/select-plan/pro">
						Get Started
					</Button>
				</div>
			</Card>
		</div>

		<p class="text-xs text-center text-muted-foreground mt-10">
			* All plans are monthly subscriptions with unlimited usage
		</p>
	</div>
</section>
