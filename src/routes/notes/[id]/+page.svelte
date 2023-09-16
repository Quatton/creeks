<script>
	import { goto } from "$app/navigation";
	import Mermaid from "$lib/components/Mermaid.svelte";
	import Tiptap from "$lib/components/Tiptap.svelte";
	import { TabGroup, Tab } from "@skeletonlabs/skeleton";

	import IconArrowLeft from "~icons/lucide/arrow-left";

	export let data;

	const note = data.note;

	let tabSet = 0;
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

<section class="container self-stretch md:p-12 flex flex-col">
	<div>
		<a href="/notes" class="btn btn-icon">
			<IconArrowLeft />
		</a>
	</div>
	<div
		class="sm:px-8 grow flex flex-col [&_>_.tab-group]:grow [&_>_.tab-group]:flex [&_>_.tab-group]:flex-col"
	>
		<div class="px-4">
			<h1 class="h1 mb-4">{$note?.title ?? "(Untitled)"}</h1>
		</div>
		<TabGroup regionPanel="grow flex flex-col">
			<Tab bind:group={tabSet} name="tab1" value={0}>
				<span>Note</span>
			</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Flowchart (Beta)</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<div class="p-4">
						<Tiptap note={$note} />
					</div>
				{:else if tabSet === 1}
					<Mermaid note={$note} />
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
</section>
