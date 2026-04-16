<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { session } from '$lib/state/session.svelte';
	import SparklesIcon from '~icons/lucide/sparkles';

	const ctaHref = $derived(session.current ? '/chat' : '/login');
	const ctaText = $derived(session.current ? 'Open Chat' : 'Get Started');
</script>

<nav class="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
	<div class="max-w-6xl mx-auto px-4 md:px-6">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2 group">
				<div class="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
					<SparklesIcon class="size-5 text-primary" />
				</div>
				<span class="text-xl font-bold">
					GoribAI
				</span>
			</a>

			<!-- Navigation Links -->
			<div class="hidden md:flex items-center gap-8">
				<a href="#features" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
					Features
				</a>
				<a href="#pricing" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
					Pricing
				</a>
				<a href="#how-it-works" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
					How it works
				</a>
			</div>

			<!-- CTA Button -->
			<Button href={ctaHref} size="default" class="font-medium">
				{ctaText}
			</Button>
		</div>
	</div>
</nav>
