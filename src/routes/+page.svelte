<script lang="ts">
	import { currentSession } from "$lib/stores/core";
	import type { CreekSession } from "$lib/types/core";

	/**
	 * Logic:
	 *
	 * On first message, if no session, create one and set the title to that message.
	 *
	 * On subsequent messages, if no session, create one and set the title to that message.
	 * (But ask yourself why that would happen.)
	 *
	 * On subsequent messages, if session, append the message to the title.
	 */

	let text = "";

	function push(text: string) {
		currentSession.update((session) => {
			if (!session) {
				return {
					id: crypto.randomUUID(),
					createdAt: new Date(),
					title: text,
					blocks: []
				};
			}
			return {
				...session,
				blocks: [
					...session.blocks,
					{
						id: crypto.randomUUID(),
						createdAt: new Date(),
						content: text
					}
				]
			};
		});
	}
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Enter") {
			push(text);
			text = "";
		}
	}}
/>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div class="h-48 w-96">
		{#if $currentSession}
			<h1 class="text-3xl font-bold">{$currentSession.title}</h1>
			{#each $currentSession.blocks as block}
				<p>{block.content}</p>
			{/each}
		{:else}
			<p>Try typing something and pressing enter.</p>
		{/if}
	</div>

	<!-- svelte-ignore a11y-autofocus -->
	<textarea
		class="w-96 max-w-full resize-none outline-none bg-transparent text-3xl"
		placeholder="Keep writing..."
		bind:value={text}
		autofocus
	/>
</section>
