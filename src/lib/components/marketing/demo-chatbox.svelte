<script lang="ts">
	import { goto } from '$app/navigation';
	import SendIcon from '~icons/lucide/send';
	import ChevronDownIcon from '~icons/lucide/chevron-down';
	import ZapIcon from '~icons/lucide/zap';
	import GlobeIcon from '~icons/lucide/globe';
	import PaperclipIcon from '~icons/lucide/paperclip';
	import SparklesIcon from '~icons/lucide/sparkles';

	let message = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		// Redirect to login when trying to send
		goto('/chat');
	}

	// AI models we support
	const aiModels = [
		{ name: 'GPT-4', logo: '🤖', color: 'from-green-500 to-emerald-600' },
		{ name: 'Claude', logo: '🧠', color: 'from-orange-500 to-amber-600' },
		{ name: 'Gemini', logo: '✨', color: 'from-blue-500 to-cyan-600' },
		{ name: 'DeepSeek', logo: '🔮', color: 'from-purple-500 to-violet-600' },
		{ name: '+ More', logo: '🔮', color: 'from-purple-500 to-violet-600' },
	];
</script>

<div class="mx-auto w-full max-w-4xl">
	<!-- AI Model Badges -->

	<!-- Chat Input Container -->
	<form onsubmit={handleSubmit} class="relative">
		<div
			class="bg-card border-border overflow-hidden rounded-2xl border shadow transition-all duration-300 hover:shadow-2xl"
		>
			<!-- Main textarea area -->
			<div class="bg-muted/30 relative min-h-[120px]">
				<textarea
					bind:value={message}
					placeholder="Type your message here..."
					class="text-foreground placeholder:text-muted-foreground/60 h-full min-h-[120px] w-full resize-none bg-transparent px-6 py-6 text-base outline-none"
				></textarea>
			</div>

			<!-- Bottom toolbar -->
			<div class="bg-background border-border flex items-center justify-between border-t px-4 py-3">
				<!-- Left side: Model picker and action buttons -->
				<div class="flex flex-wrap items-center gap-2">
					<!-- Model Picker -->
					<button
						type="button"
						onclick={() => goto('/login')}
						class="bg-muted hover:bg-muted/80 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
					>
						<span>GPT-4o</span>
						<span class="text-xs font-bold text-green-500">$$•</span>
						<ChevronDownIcon class="text-muted-foreground size-4" />
					</button>

					<!-- Instant Mode Badge -->
					<button
						type="button"
						onclick={() => goto('/login')}
						class="bg-muted/50 hover:bg-muted flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors"
					>
						<ZapIcon class="size-4 text-yellow-500" />
						<span>Instant</span>
					</button>

					<!-- Search Toggle -->
					<button
						type="button"
						onclick={() => goto('/login')}
						class="bg-muted/50 hover:bg-muted flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors"
					>
						<GlobeIcon class="size-4 text-blue-500" />
						<span>Search</span>
					</button>

					<!-- Attach Button -->
					<button
						type="button"
						onclick={() => goto('/login')}
						class="bg-muted/50 hover:bg-muted flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors"
					>
						<PaperclipIcon class="size-4 text-purple-500" />
						<span>Attach</span>
					</button>
				</div>

				<!-- Right side: Send button -->
				<button
					type="submit"
					class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl p-3 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
					disabled={!message.trim()}
				>
					<SendIcon class="size-5" />
				</button>
			</div>
		</div>
	</form>

	<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
		<span class="text-muted-foreground text-xs font-medium">Powered by:</span>
		{#each aiModels as model}
			<div class="flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/500 px-3 py-1">
				<span class="text-xs font-medium text-black">{model.name}</span>
			</div>
		{/each}
	</div>
</div>
