<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { useQuery } from 'convex/react';
	import { api } from '$lib/backend/convex/_generated/api';
	import { session } from '$lib/state/session.svelte';

	/**
	 * Guard component to check if user has an active subscription
	 * Redirects to /select-plan if no active subscription found
	 */
	export let requiredPlan: 'basic' | 'pro' | null = null; // null means any active plan
	export let redirectTo: string = '/select-plan';

	const sessionToken = session.current?.session?.token;

	const planInfo = useQuery(
		api.subscriptions.getUserPlanInfo,
		sessionToken ? { session_token: sessionToken } : 'skip'
	);

	$: {
		if (planInfo) {
			// Allow users with active status (including free plan with their own API keys)
			// Only block if subscription has expired or been cancelled
			const hasExpiredSubscription = planInfo.status === 'expired' || planInfo.status === 'cancelled';

			if (hasExpiredSubscription) {
				// Expired or cancelled subscription, redirect to select-plan
				goto(redirectTo);
			} else if (requiredPlan) {
				// If specific plan required, check if user has it
				const hasRequiredPlan = planInfo.plan === requiredPlan || planInfo.plan === 'pro';
				if (!hasRequiredPlan) {
					goto(redirectTo);
				}
			}
		}
	}
</script>

<!-- This component doesn't render anything, it just guards the route -->
<slot />
