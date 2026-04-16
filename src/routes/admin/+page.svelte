<script lang="ts">
	import { goto } from '$app/navigation';
	import { useCachedQuery } from '$lib/cache/cached-query.svelte';
	import { api } from '$lib/backend/convex/_generated/api';
	import { session } from '$lib/state/session.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { getPlanDisplayName, formatSubscriptionEndDate, getDaysRemaining } from '$lib/utils/subscription';
	import type { Id } from '$lib/backend/convex/_generated/dataModel';
	import ShieldCheckIcon from '~icons/lucide/shield-check';
	import UserIcon from '~icons/lucide/user';
	import CalendarIcon from '~icons/lucide/calendar';
	import CrownIcon from '~icons/lucide/crown';
	import XCircleIcon from '~icons/lucide/x-circle';
	import PlusCircleIcon from '~icons/lucide/plus-circle';

	const client = useConvexClient();

	// Check if user is admin
	const isAdminQuery = useCachedQuery(api.admin.checkIsAdmin, {
		session_token: session.current?.session.token ?? '',
	});

	// Get all users with subscriptions
	const usersQuery = useCachedQuery(api.admin.getAllUsers, {
		session_token: session.current?.session.token ?? '',
	});

	let selectedUser: any = $state(null);
	let showCreateModal = $state(false);
	let createForm = $state({
		plan: 'basic' as 'basic' | 'pro',
		duration_days: 30,
		payment_method: 'bkash',
		transaction_id: '',
		notes: '',
	});

	async function createSubscription() {
		if (!selectedUser || !session.current?.session.token) return;

		try {
			await client.mutation(api.admin.createUserSubscription, {
				session_token: session.current.session.token,
				user_id: selectedUser.id,
				plan: createForm.plan,
				duration_days: createForm.duration_days,
				payment_method: createForm.payment_method,
				transaction_id: createForm.transaction_id,
				notes: createForm.notes,
			});

			// Reset form and close modal
			showCreateModal = false;
			selectedUser = null;
			createForm = {
				plan: 'basic',
				duration_days: 30,
				payment_method: 'bkash',
				transaction_id: '',
				notes: '',
			};

			// Refresh users list
			usersQuery.refetch?.();
		} catch (error) {
			console.error('Failed to create subscription:', error);
			alert('Failed to create subscription: ' + error);
		}
	}

	async function cancelSubscription(subscriptionId: Id<'subscriptions'>) {
		if (!session.current?.session.token) return;
		if (!confirm('Are you sure you want to cancel this subscription?')) return;

		try {
			await client.mutation(api.admin.cancelUserSubscription, {
				session_token: session.current.session.token,
				subscription_id: subscriptionId,
				notes: 'Cancelled by admin',
			});

			// Refresh users list
			usersQuery.refetch?.();
		} catch (error) {
			console.error('Failed to cancel subscription:', error);
			alert('Failed to cancel subscription: ' + error);
		}
	}

	async function extendSubscription(subscriptionId: Id<'subscriptions'>, days: number) {
		if (!session.current?.session.token) return;

		try {
			await client.mutation(api.admin.extendUserSubscription, {
				session_token: session.current.session.token,
				subscription_id: subscriptionId,
				additional_days: days,
				notes: `Extended by ${days} days by admin`,
			});

			// Refresh users list
			usersQuery.refetch?.();
		} catch (error) {
			console.error('Failed to extend subscription:', error);
			alert('Failed to extend subscription: ' + error);
		}
	}

	function openCreateModal(user: any) {
		selectedUser = user;
		showCreateModal = true;
	}

	// Redirect if not admin
	$effect(() => {
		if (isAdminQuery.data === false) {
			goto('/');
		}
	});
</script>

<svelte:head>
	<title>Admin Panel | gorib ai</title>
</svelte:head>

{#if isAdminQuery.data === true}
	<div class="container mx-auto max-w-7xl space-y-6 py-8 px-4">
		<!-- Header -->
		<div class="flex items-center gap-3">
			<ShieldCheckIcon class="size-8 text-primary" />
			<div>
				<h1 class="text-3xl font-bold">Admin Panel</h1>
				<p class="text-muted-foreground text-sm">Manage users and subscriptions</p>
			</div>
		</div>

		<!-- Users List -->
		{#if usersQuery.data}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">All Users ({usersQuery.data.length})</h2>
				</div>

				<div class="grid gap-4">
					{#each usersQuery.data as user}
						<Card class="p-6">
							<div class="space-y-4">
								<!-- User Info -->
								<div class="flex items-start justify-between">
									<div class="flex items-center gap-4">
										{#if user.image}
											<img src={user.image} alt={user.name} class="size-12 rounded-full" />
										{:else}
											<div class="bg-muted flex size-12 items-center justify-center rounded-full">
												<UserIcon class="size-6" />
											</div>
										{/if}
										<div>
											<h3 class="font-semibold text-lg">{user.name}</h3>
											<p class="text-sm text-muted-foreground">{user.email}</p>
											<p class="text-xs text-muted-foreground">
												User ID: {user.id}
											</p>
										</div>
									</div>

									<!-- Subscription Status Badge -->
									{#if user.subscription}
										<div class="flex items-center gap-2">
											{#if user.subscription.status === 'active'}
												<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
													Active
												</span>
											{:else if user.subscription.status === 'expired'}
												<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
													Expired
												</span>
											{:else}
												<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													Cancelled
												</span>
											{/if}
											<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												{getPlanDisplayName(user.subscription.plan)}
											</span>
										</div>
									{:else}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
											No Subscription
										</span>
									{/if}
								</div>

								<!-- Subscription Details -->
								{#if user.subscription}
									<div class="bg-muted/50 rounded-lg p-4 space-y-2">
										<div class="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span class="text-muted-foreground">Start Date:</span>
												<span class="ml-2 font-medium">
													{formatSubscriptionEndDate(user.subscription.start_date)}
												</span>
											</div>
											<div>
												<span class="text-muted-foreground">End Date:</span>
												<span class="ml-2 font-medium">
													{formatSubscriptionEndDate(user.subscription.end_date)}
												</span>
											</div>
											<div>
												<span class="text-muted-foreground">Days Remaining:</span>
												<span class="ml-2 font-medium">
													{getDaysRemaining(user.subscription.end_date)} days
												</span>
											</div>
											{#if user.subscription.payment_method}
												<div>
													<span class="text-muted-foreground">Payment Method:</span>
													<span class="ml-2 font-medium">{user.subscription.payment_method}</span>
												</div>
											{/if}
											{#if user.subscription.transaction_id}
												<div class="col-span-2">
													<span class="text-muted-foreground">Transaction ID:</span>
													<span class="ml-2 font-mono text-xs">{user.subscription.transaction_id}</span>
												</div>
											{/if}
											{#if user.subscription.notes}
												<div class="col-span-2">
													<span class="text-muted-foreground">Notes:</span>
													<span class="ml-2 text-xs">{user.subscription.notes}</span>
												</div>
											{/if}
										</div>
									</div>

									<!-- Actions -->
									<div class="flex gap-2">
										{#if user.subscription.status === 'active'}
											<Button
												size="sm"
												variant="outline"
												onclick={() => extendSubscription(user.subscription.id, 30)}
											>
												<CalendarIcon class="size-4 mr-2" />
												Extend 30 Days
											</Button>
											<Button
												size="sm"
												variant="outline"
												onclick={() => cancelSubscription(user.subscription.id)}
											>
												<XCircleIcon class="size-4 mr-2" />
												Cancel
											</Button>
										{/if}
										<Button
											size="sm"
											variant="outline"
											onclick={() => openCreateModal(user)}
										>
											<CrownIcon class="size-4 mr-2" />
											{user.subscription.plan === 'basic' ? 'Upgrade to Pro' : 'Change Plan'}
										</Button>
									</div>
								{:else}
									<!-- No subscription - create one -->
									<Button
										size="sm"
										onclick={() => openCreateModal(user)}
									>
										<PlusCircleIcon class="size-4 mr-2" />
										Create Subscription
									</Button>
								{/if}
							</div>
						</Card>
					{/each}
				</div>
			</div>
		{:else}
			<Card class="p-6">
				<div class="text-center text-muted-foreground">
					Loading users...
				</div>
			</Card>
		{/if}
	</div>

	<!-- Create/Update Subscription Modal -->
	{#if showCreateModal && selectedUser}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<Card class="w-full max-w-md p-6 m-4">
				<h3 class="text-xl font-bold mb-4">
					{selectedUser.subscription ? 'Update' : 'Create'} Subscription for {selectedUser.name}
				</h3>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						createSubscription();
					}}
					class="space-y-4"
				>
					<div>
						<label class="text-sm font-medium mb-2 block">Plan</label>
						<select
							bind:value={createForm.plan}
							class="bg-background border-border w-full rounded-lg border px-3 py-2"
						>
							<option value="basic">Basic (৳500/month)</option>
							<option value="pro">Pro (৳1000/month)</option>
						</select>
					</div>

					<div>
						<label class="text-sm font-medium mb-2 block">Duration (days)</label>
						<input
							type="number"
							bind:value={createForm.duration_days}
							min="1"
							class="bg-background border-border w-full rounded-lg border px-3 py-2"
						/>
					</div>

					<div>
						<label class="text-sm font-medium mb-2 block">Payment Method</label>
						<input
							type="text"
							bind:value={createForm.payment_method}
							placeholder="e.g., bkash"
							class="bg-background border-border w-full rounded-lg border px-3 py-2"
						/>
					</div>

					<div>
						<label class="text-sm font-medium mb-2 block">Transaction ID</label>
						<input
							type="text"
							bind:value={createForm.transaction_id}
							placeholder="e.g., TXN123456"
							class="bg-background border-border w-full rounded-lg border px-3 py-2"
						/>
					</div>

					<div>
						<label class="text-sm font-medium mb-2 block">Notes</label>
						<textarea
							bind:value={createForm.notes}
							placeholder="Optional notes..."
							rows="3"
							class="bg-background border-border w-full rounded-lg border px-3 py-2"
						></textarea>
					</div>

					<div class="flex gap-2">
						<Button type="submit" class="flex-1">
							{selectedUser.subscription ? 'Update' : 'Create'} Subscription
						</Button>
						<Button
							type="button"
							variant="outline"
							onclick={() => {
								showCreateModal = false;
								selectedUser = null;
							}}
						>
							Cancel
						</Button>
					</div>
				</form>
			</Card>
		</div>
	{/if}
{:else if isAdminQuery.isLoading}
	<div class="container mx-auto max-w-7xl py-8 px-4">
		<Card class="p-6">
			<div class="text-center text-muted-foreground">
				Checking permissions...
			</div>
		</Card>
	</div>
{/if}
