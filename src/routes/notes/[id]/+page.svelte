<script>
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Tiptap from "$lib/components/Tiptap.svelte";
	import { sessions } from "$lib/stores/core";
	import { derived } from "svelte/store";

	import IconArrowLeft from "~icons/lucide/arrow-left";

	const noteId = $page.params.id;

	const note = derived(sessions, ($sessions) => {
		if (!$sessions) return null;
		return $sessions.find((session) => session.id === noteId);
	});
</script>

<svelte:head>
	<title>Note - {$note?.title ?? "Not found"}</title>
	<meta name="description" content="Your saved notes" />
</svelte:head>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Escape") {
			goto("/notes", {
				replaceState: true
			});
		}
	}}
/>

<section class="container self-start p-12">
	<div>
		<a href="/notes" class="btn btn-icon">
			<IconArrowLeft />
		</a>
	</div>
	<div class="px-8">
		<h1 class="h1 mb-4">{$note?.title ?? "(Not found)"}</h1>
		{#if $note}
			<Tiptap note={$note} />
		{:else}
			<p>Sorry, we couldn't find the note you were looking for.</p>
		{/if}
	</div>
</section>
