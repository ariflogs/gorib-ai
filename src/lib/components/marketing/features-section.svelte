<script lang="ts">
	import WalletIcon from '~icons/lucide/wallet';
	import SparklesIcon from '~icons/lucide/sparkles';
	import CoinsIcon from '~icons/lucide/coins';
</script>

<section class="py-20 md:py-28">
	<div class="max-w-7xl mx-auto px-4 md:px-6">
		<h2 class="text-4xl md:text-5xl font-bold text-center mb-24">
			Keno Ghorib	AI Sera?
		</h2>

		<div class="space-y-24">
			<!-- Feature 1: No USD Needed (Text - Image) -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div class="space-y-6">
					<div class="inline-flex p-3 bg-primary/10 rounded-2xl">
						<WalletIcon class="size-8 text-primary" />
					</div>
					<h3 class="text-3xl md:text-4xl font-bold">
						No USD Needed
					</h3>
					<p class="text-lg text-muted-foreground leading-relaxed">
						Pay with bKash. No credit card or dual currency card required. We understand the struggle of international payments, so we made it simple for Bangladeshis.
					</p>
				</div>
				<div class="relative">
					<div class="aspect-video rounded-2xl overflow-hidden border border-border shadow-xl bg-muted/20">
						<img src="/images/no-usd.png" alt="No USD payment needed" class="w-full h-full object-cover" />
					</div>
				</div>
			</div>

			<!-- Feature 2: All Models, One Place (Image - Text) -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div class="relative order-2 lg:order-1">
					<div class="aspect-video rounded-2xl overflow-hidden border border-border shadow-xl bg-muted/20">
						<img src="/images/all-in-one-ai.png" alt="All AI models in one place" class="w-full h-full object-cover" />
					</div>
				</div>
				<div class="space-y-6 order-1 lg:order-2">
					<div class="inline-flex p-3 bg-primary/10 rounded-2xl">
						<SparklesIcon class="size-8 text-primary" />
					</div>
					<h3 class="text-3xl md:text-4xl font-bold">
						All Models, One Place
					</h3>
					<p class="text-lg text-muted-foreground leading-relaxed">
						Access Claude, GPT, image generation, and more in one chat app. No need to juggle multiple subscriptions or platforms. Everything you need, all in one place.
					</p>
				</div>
			</div>

			<!-- Feature 3: Way Cheaper (Text - Image) -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div class="space-y-6">
					<div class="inline-flex p-3 bg-primary/10 rounded-2xl">
						<CoinsIcon class="size-8 text-primary" />
					</div>
					<h3 class="text-3xl md:text-4xl font-bold">
						Way Cheaper Than Separate Subscriptions
					</h3>
					<p class="text-lg text-muted-foreground leading-relaxed">
						ChatGPT Plus, Claude Pro, and Gemini Advanced would cost you thousands per month. Get all of them plus more for a fraction of the price with one simple subscription.
					</p>
				</div>
				<div class="relative">
					<div class="aspect-video rounded-2xl overflow-hidden border border-border shadow-xl bg-muted/20">
						<img src="/images/no-subscription.png" alt="Cheaper than multiple subscriptions" class="w-full h-full object-cover" />
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
