<script>
	import { page } from "$app/stores";
	import Tiptap from "$lib/components/Tiptap.svelte";
	import { sessions } from "$lib/stores/core";
	import { derived } from "svelte/store";

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

<section class="container self-start p-12 prose prose-p:my-0.5">
	{#if $note}
		<h1>{$note.title}</h1>
		<Tiptap note={$note} />
	{:else}
		<h1>Not found</h1>
		<p>Sorry, we couldn't find the note you were looking for.</p>
	{/if}
</section>
