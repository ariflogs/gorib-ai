<script lang="ts">
	import Navbar from '$lib/components/marketing/navbar.svelte';
	import HeroSection from '$lib/components/marketing/hero-section.svelte';
	import FeaturesSection from '$lib/components/marketing/features-section.svelte';
	import PricingSection from '$lib/components/marketing/pricing-section.svelte';
	import HowItWorksSection from '$lib/components/marketing/how-it-works-section.svelte';
	import FaqSection from '$lib/components/marketing/faq-section.svelte';
	import FooterSection from '$lib/components/marketing/footer-section.svelte';
</script>

<div class="min-h-screen flex flex-col">
	<Navbar />
	<div class="flex-1">
		<HeroSection />
		<div id="features">
			<FeaturesSection />
		</div>
		<div id="pricing">
			<PricingSection />
		</div>
		<div id="how-it-works">
			<HowItWorksSection />
		</div>
		<div id="faq">
			<FaqSection />
		</div>
	</div>
	<FooterSection />
</div>
