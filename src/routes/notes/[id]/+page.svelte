<script lang="ts">
	import { goto } from "$app/navigation";
	import Mermaid from "$lib/components/Mermaid.svelte";
	import Tiptap from "$lib/components/Tiptap.svelte";
	import { TabGroup, Tab } from "@skeletonlabs/skeleton";
	import { format } from "date-fns";

	import IconArrowLeft from "~icons/lucide/arrow-left";

	export let data;

	const note = data.note;

	let tabSet = 0;
</script>

<svelte:head>
	<title>Note - {$note?.title ?? "Not found"}</title>
	<meta name="description" content="Your saved notes" />
</svelte:head>

<section class="container self-stretch md:p-12 flex flex-col">
	<div class="flex items-center mb-4 gap-4">
		<a href="/notes" class="btn-icon-lg">
			<IconArrowLeft />
		</a>
		<div class="space-y-2">
			<h1 class="h1">{$note?.title ?? "(Untitled)"}</h1>
			<p>{format(new Date($note.createdAt), "yyyy MMM dd - HH:mm:ss")}</p>
		</div>
	</div>
	<div
		class="h-full sm:px-8 grow flex flex-col overflow-hidden [&_>_.tab-group]:h-full [&_>_.tab-group]:flex [&_>_.tab-group]:flex-col [&_>_.tab-group]:space-y-0 [&_>_.tab-group]:gap-2"
	>
		<TabGroup regionPanel="grow min-h-0 flex flex-col" regionList="shrink-0">
			<Tab bind:group={tabSet} name="tab1" value={0}>
				<span>Note</span>
			</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Flowchart (Beta)</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<Tiptap note={$note} />
				{:else if tabSet === 1}
					<Mermaid note={$note} />
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
</section>
