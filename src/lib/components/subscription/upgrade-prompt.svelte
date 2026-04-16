<script lang="ts">
	import { getRequiredPlan, getPlanDisplayName, getPlanPrice } from '$lib/utils/subscription';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import LockIcon from '~icons/lucide/lock';

	export let modelId: string;
	export let modelName: string = modelId;

	const requiredPlan = getRequiredPlan(modelId);
	const planName = getPlanDisplayName(requiredPlan);
	const price = getPlanPrice(requiredPlan);
</script>

<Card class="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
	<div class="flex flex-col items-center text-center space-y-4">
		<div class="p-3 bg-primary/10 rounded-full">
			<LockIcon class="size-8 text-primary" />
		</div>

		<div class="space-y-2">
			<h3 class="text-xl font-bold">Upgrade to Access {modelName}</h3>
			<p class="text-muted-foreground max-w-md">
				This model is available on the <span class="font-semibold text-foreground">{planName}</span> plan.
				Upgrade now to unlock access to premium AI models.
			</p>
		</div>

		<div class="flex items-baseline gap-2">
			<span class="text-3xl font-bold text-primary">৳{price}</span>
			<span class="text-muted-foreground">/month</span>
		</div>

		<div class="flex gap-3 pt-2">
			<Button href="/select-plan" size="lg">
				View Plans
			</Button>
			<Button href="/#pricing" variant="outline" size="lg">
				Learn More
			</Button>
		</div>

		<p class="text-xs text-muted-foreground pt-2">
			No credit card required. Pay with bKash.
		</p>
	</div>
</Card>
