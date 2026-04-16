<script lang="ts">
	import UserPlusIcon from '~icons/lucide/user-plus';
	import WalletIcon from '~icons/lucide/wallet';
	import CoinsIcon from '~icons/lucide/coins';
	import MessageSquareIcon from '~icons/lucide/message-square';
</script>

<section class="py-20 md:py-28">
	<div class="max-w-6xl mx-auto px-4 md:px-6">
		<div class="text-center mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-4">
				How It Works
			</h2>
			<p class="text-lg text-muted-foreground">
				Start chatting with AI in 4 simple steps
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			<!-- Step 1: Sign Up -->
			<div class="flex flex-col items-center text-center gap-5">
				<div class="relative">
					<div class="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10">
						<UserPlusIcon class="size-12 text-primary" />
					</div>
					<div class="absolute -top-3 -right-3 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
						1
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-bold">Sign Up</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">
						Create account with Google or GitHub
					</p>
				</div>
			</div>

			<!-- Step 2: Pay via bKash -->
			<div class="flex flex-col items-center text-center gap-5">
				<div class="relative">
					<div class="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10">
						<WalletIcon class="size-12 text-primary" />
					</div>
					<div class="absolute -top-3 -right-3 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
						2
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-bold">Pay via bKash</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">
						Send payment to our bKash number
					</p>
				</div>
			</div>

			<!-- Step 3: Get Credits -->
			<div class="flex flex-col items-center text-center gap-5">
				<div class="relative">
					<div class="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10">
						<CoinsIcon class="size-12 text-primary" />
					</div>
					<div class="absolute -top-3 -right-3 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
						3
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-bold">Get Credits</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">
						We'll add credits to your account within minutes
					</p>
				</div>
			</div>

			<!-- Step 4: Start Chatting -->
			<div class="flex flex-col items-center text-center gap-5">
				<div class="relative">
					<div class="p-5 bg-primary/5 rounded-2xl border-2 border-primary/10">
						<MessageSquareIcon class="size-12 text-primary" />
					</div>
					<div class="absolute -top-3 -right-3 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
						4
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-bold">Start Chatting</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">
						Choose your model and start using AI
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
