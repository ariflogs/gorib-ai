<script lang="ts">
	import DemoChatbox from './demo-chatbox.svelte';
</script>

<section class="relative overflow-hidden py-24 md:py-32 lg:py-40">
	<!-- Dotted background with fade effect -->
	<div class="absolute inset-0 -z-10 dotted-background"></div>

	<div class="mx-auto max-w-5xl px-4 md:px-6">
		<div class="flex flex-col items-center gap-12 text-center">
			<!-- Main heading with modern typography -->
			<div class="max-w-4xl space-y-6">
				<h1
					class="text-foreground text-5xl leading-[1.1] font-bold tracking-tight md:text-6xl lg:text-7xl"
					style="font-family: 'Cabinet Grotesk', sans-serif;"
				>
					Dual currency card nai?<br />
					Well,
					<span class="relative inline-block z-1"
						>Pera Nai!!<svg
							class="absolute -z-1 bottom-2 left-0 h-4 w-full opacity-80"
							viewBox="0 0 200 12"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							preserveAspectRatio="none"
						>
							<path
								d="M2 9C20 3 40 1 60 4C80 7 100 2 120 5C140 8 160 3 180 7C185 8 190 9 198 10"
								stroke="oklch(0.55 0.22 25)"
								stroke-width="20"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg></span
					>
				</h1>
				<p class="text-muted-foreground mx-auto max-w-xl text-lg font-normal md:text-xl">
					A simple er moddhe gorgeous AI chat app for fellow Bangladeshis 🇧🇩.
				</p>
			</div>

			<!-- Interactive demo chatbox -->
			<div class="w-full max-w-3xl">
				<DemoChatbox />
			</div>
		</div>
	</div>
</section>

<style>
	.dotted-background {
		background-image: radial-gradient(circle, oklch(0.7 0.05 280) 1px, transparent 1px);
		background-size: 24px 24px;
		mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%);
		-webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%);
	}

	:global(.dark) .dotted-background {
		background-image: radial-gradient(circle, oklch(0.35 0.03 280) 1px, transparent 1px);
	}
</style>
