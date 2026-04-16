<script lang="ts">
	import { goto } from '$app/navigation';
	import SendIcon from '~icons/lucide/send';

	let message = $state('');
	let isFocused = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		// Redirect to login when trying to send
		goto('/login');
	}

	function handleFocus() {
		isFocused = true;
	}

	function handleBlur() {
		isFocused = false;
	}
</script>

<form onsubmit={handleSubmit} class="w-full max-w-3xl mx-auto">
	<div class="relative">
		<!-- Chat input container -->
		<div
			class="relative bg-card border border-border rounded-2xl transition-all duration-200 {isFocused ? 'ring-2 ring-primary/20 border-primary/50 shadow-lg' : 'shadow-md hover:shadow-lg'}"
		>
			<!-- Textarea -->
			<textarea
				bind:value={message}
				onfocus={handleFocus}
				onblur={handleBlur}
				placeholder="Ask me anything... (Try it!)"
				rows="1"
				class="w-full px-5 py-4 pr-14 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground rounded-2xl"
				style="field-sizing: content; max-height: 200px;"
			></textarea>

			<!-- Send button -->
			<button
				type="submit"
				class="absolute right-3 bottom-3 p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
				disabled={!message.trim()}
			>
				<SendIcon class="size-5" />
			</button>
		</div>

		<!-- Helper text -->
		<p class="text-xs text-muted-foreground text-center mt-3">
			Sign up to start chatting with AI
		</p>
	</div>
</form>
