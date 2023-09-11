<script>
	import { goto } from "$app/navigation";
	import Tiptap from "$lib/components/Tiptap.svelte";

	import IconArrowLeft from "~icons/lucide/arrow-left";

	export let data;

	const note = data.note;
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
		<h1 class="h1 mb-4">{$note?.title ?? "(Untitled)"}</h1>
		<Tiptap note={$note} />
	</div>
</section>
