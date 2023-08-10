<script lang="ts">
	import Disappearing from "$lib/components/Disappearing.svelte";
	import { currentSession } from "$lib/stores/core";
	import { disappearingStore } from "$lib/stores/disappearing";
	import Result from "./Result.svelte";

	import Writer from "./Writer.svelte";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<svelte:window
	on:keydown={(e) => {
		if (e.altKey && e.key === "w" && $currentSession) {
			e.preventDefault();
			currentSession.update((session) => {
				if (!session) return null;
				return {
					...session,
					content:
						session.content.at(-1) === "\n"
							? session.content
							: session.content + "\n",
					mode: session.mode === "edit" ? "flow" : "edit"
				};
			});
		}
	}}
/>

<section class="mx-auto p-4 container space-y-1">
	{#if $currentSession}
		<h1 class="text-3xl font-bold">{$currentSession.title}</h1>
		<!-- {#each $currentSession.blocks as block}
				<p>{block.content}</p>
			{/each} -->
	{:else}
		<p>What's the goal of this session?</p>
	{/if}

	<div class="relative h-96">
		{#if !$currentSession || $currentSession.mode !== "edit"}
			<Writer />
			{#each $disappearingStore as disappearing (disappearing.id)}
				<Disappearing setting={disappearing} className="text-3xl" />
			{/each}
		{:else if $currentSession.mode === "edit"}
			<Result />
		{/if}
	</div>

	<div class="space-x-1">
		<span class="chip variant-filled"> Enter | Flush </span>
		<span class="chip variant-filled-error"> ESC | End session </span>
	</div>
</section>
