<script lang="ts">
	import TwitterIcon from '~icons/lucide/twitter';
	import LinkedinIcon from '~icons/lucide/linkedin';
	import MailIcon from '~icons/lucide/mail';
</script>

<footer class="border-t border-border py-12 md:py-16 bg-muted/10">
	<div class="max-w-6xl mx-auto px-4 md:px-6">
		<div class="flex flex-col items-center gap-6 text-center">
			<div class="space-y-2">
				<p class="text-lg font-bold">
					GoribAI
				</p>
				<p class="text-sm text-muted-foreground">
					AI for everyone in Bangladesh
				</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-6">
				<a
					href="https://x.com/ariflogs"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Follow on X"
				>
					<TwitterIcon class="size-4" />
					<span class="text-sm font-medium">@ariflogs</span>
				</a>
				<a
					href="https://linkedin.com/in/ariflogs"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Connect on LinkedIn"
				>
					<LinkedinIcon class="size-4" />
					<span class="text-sm font-medium">LinkedIn</span>
				</a>
				<a
					href="mailto:arif@ariflogs.com"
					class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Send email"
				>
					<MailIcon class="size-4" />
					<span class="text-sm font-medium">arif@ariflogs.com</span>
				</a>
			</div>
			<div class="pt-4 border-t border-border w-full max-w-md">
				<p class="text-xs text-muted-foreground">
					© 2026 GoribAI. All rights reserved.
				</p>
			</div>
		</div>
	</div>
</footer>
