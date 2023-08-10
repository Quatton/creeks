<script lang="ts">
	import Disappearing from "$lib/components/Disappearing.svelte";
	import { currentSession } from "$lib/stores/core";
	import { disappearingStore } from "$lib/stores/disappearing";

	import Writer from "./Writer.svelte";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="mx-auto p-4 container">
	{#if $currentSession}
		<h1 class="text-3xl font-bold">{$currentSession.title}</h1>
		<!-- {#each $currentSession.blocks as block}
				<p>{block.content}</p>
			{/each} -->
	{:else}
		<p>What's the goal of this session?</p>
	{/if}

	<div class="relative h-96">
		<Writer />
		{#each $disappearingStore as disappearing (disappearing.id)}
			<Disappearing setting={disappearing} className="text-3xl" />
		{/each}
	</div>

	<div class="space-x-1">
		<span class="chip variant-filled"> Enter | Flush </span>
		<span class="chip variant-filled-error"> ESC | End session </span>
	</div>
</section>
