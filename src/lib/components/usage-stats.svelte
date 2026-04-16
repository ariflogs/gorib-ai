<script lang="ts">
	import { api } from '$lib/backend/convex/_generated/api';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { session } from '$lib/state/session.svelte';
	import { getModelById } from '$lib/utils/models';
	import ChevronDownIcon from '~icons/lucide/chevron-down';

	const usageStats = useCachedQuery(api.rate_limiter.getUsageStats, {
		session_token: session.current?.session.token ?? '',
	});

	const planInfo = useCachedQuery(api.subscriptions.getUserPlanInfo, {
		session_token: session.current?.session.token ?? '',
	});

	const stats = $derived(usageStats.data);
	const userPlan = $derived(planInfo.data?.plan || 'free');

	let showModelBreakdown = $state(false);

	function getProgressColor(current: number, limit: number): string {
		const percentage = (current / limit) * 100;
		if (percentage >= 90) return 'bg-red-500';
		if (percentage >= 75) return 'bg-yellow-500';
		return 'bg-blue-500';
	}

	function formatPlanType(planType: string): string {
		return planType.charAt(0).toUpperCase() + planType.slice(1);
	}

	function getPercentage(current: number, limit: number): number {
		if (limit === 0) return 0;
		return Math.min(100, (current / limit) * 100);
	}

	function getModelName(modelId: string): string {
		const model = getModelById(modelId, userPlan);
		return model?.name || modelId;
	}
</script>
