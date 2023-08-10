<script lang="ts">
	import { currentSession } from "$lib/stores/core";

	import Writer from "./Writer.svelte";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="mx-auto p-4 container h-96">
	{#if $currentSession}
		<h1 class="text-3xl font-bold">{$currentSession.title}</h1>
		<!-- {#each $currentSession.blocks as block}
				<p>{block.content}</p>
			{/each} -->
	{:else}
		<p>What's the goal of this session?</p>
	{/if}

	<Writer />
</section>
