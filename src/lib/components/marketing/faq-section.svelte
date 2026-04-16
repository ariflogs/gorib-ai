<script lang="ts">
	import ChevronDownIcon from '~icons/lucide/chevron-down';

	const faqs = [
		{
			question: 'How does the pricing work?',
			answer: 'We offer two monthly subscription plans: Basic (৳500/month) with access to fast models like GPT-5 mini, Gemini Flash, and Claude Haiku, and Pro (৳1,000/month) with everything in Basic plus premium models like GPT-5.4, Claude Sonnet'
		},
		{
			question: 'What payment methods do you accept?',
			answer: 'We accept bKash'
		},
		{
			question: 'Can I cancel my subscription anytime?',
			answer: 'Yes! You can cancel your subscription at any time. Your access will continue until the end of your current billing period.'
		},
		{
			question: 'Which AI models are included?',
			answer: 'Basic plan includes GPT, Gemini, DeepSeek, Claude, and Grok. We are working to add more models to our platform.'
		},
		{
			question: 'How is this cheaper than ChatGPT Plus or Claude Pro?',
			answer: 'ChatGPT Plus costs $20/month, Claude Pro costs $20/month, and Gemini Advanced costs $20/month. That\'s $60/month for three subscriptions. Our Pro plan gives you access to all of these models plus more for just ৳1,000/month (~$8), saving you hundreds of dollars.'
		},
		{
			question: 'Can I share my subscription with others?',
			answer: 'No, as we have to pay for underlying AI costs, you can imagine how expensive it would be if we allowed sharing. If we find anyone sharing their subscription, we will ban their account immediately.'
		}
	];

	let openItems: Record<number, boolean> = {};

	function toggleItem(index: number) {
		openItems[index] = !openItems[index];
	}
</script>

<section class="py-20 md:py-28 bg-muted/20">
	<div class="max-w-3xl mx-auto px-4 md:px-6">
		<div class="text-center mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-4">
				Frequently Asked Questions
			</h2>
			<p class="text-lg text-muted-foreground">
				Got questions? We've got answers.
			</p>
		</div>

		<div class="space-y-4">
			{#each faqs as faq, index}
				<div class="border border-border rounded-lg bg-card overflow-hidden">
					<button
						on:click={() => toggleItem(index)}
						class="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
					>
						<h3 class="text-lg font-medium pr-4">
							{faq.question}
						</h3>
						<ChevronDownIcon
							class="size-5 text-muted-foreground transition-transform duration-200 flex-shrink-0"
							style="transform: rotate({openItems[index] ? '180deg' : '0deg'})"
						/>
					</button>
					{#if openItems[index]}
						<div class="px-6 pb-5 pt-2">
							<p class="text-muted-foreground leading-relaxed">
								{faq.answer}
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
