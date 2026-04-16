<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { shortcut } from '$lib/actions/shortcut.svelte';
	import GlobalModal from '$lib/components/ui/modal/global-modal.svelte';
	import { models } from '$lib/state/models.svelte';
	import { setupConvex } from 'convex-svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { browser } from '$app/environment';
	import { MetaTags } from 'svelte-meta-tags';
	import { page } from '$app/state';
	import { setupLastChat } from '$lib/state/last-chat.svelte';

	let { children } = $props();

	setupConvex(PUBLIC_CONVEX_URL);
	const lastChat = setupLastChat();
	models.init();

	$effect(() => {
		if (page.url.pathname.startsWith('/chat')) {
			lastChat.current = page.params?.id ?? null;
		}
	});
</script>

<MetaTags
	title="GoribAI - AI Chat for Bangladesh"
	description="AI chat for Bangladesh. Pay with bKash. No USD needed. Access Claude, GPT, and 400+ AI models."
	keywords={['ai', 'chat', 'bangladesh', 'bkash', 'claude', 'gpt', 'chatbot']}
	twitter={{
		cardType: 'summary_large_image',
		title: 'GoribAI - AI Chat for Bangladesh',
		description: 'AI chat for Bangladesh. Pay with bKash. No USD needed.',
		image: 'https://gorib ai/og.png',
		creator: '@thomasglopes',
	}}
	openGraph={{
		url: page.url.toString(),
		type: 'website',
		title: 'GoribAI - AI Chat for Bangladesh',
		description: 'AI chat for Bangladesh. Pay with bKash. No USD needed. Access Claude, GPT, and 400+ AI models.',
		siteName: 'GoribAI',
		images: [
			{
				url: 'https://gorib ai/og.png',
				width: 2014,
				height: 1143,
				alt: 'GoribAI',
			},
		],
	}}
/>

<svelte:window
	use:shortcut={{ ctrl: true, shift: true, key: 'o', callback: () => goto('/chat') }}
/>

<ModeWatcher />
{#if browser}
	{@render children()}
{/if}

<GlobalModal />
