<script lang="ts">
	import { getNoteStore } from "$lib/stores/core";
	import { addNewNode, updateMermaidNode } from "$lib/utils/mermaid";
	import { getModalStore } from "@skeletonlabs/skeleton";

	export let node: {
		id: string;
		label: string;
	};
	export let noteId: string;

	let label = node.label;

	const modalStore = getModalStore();
	const noteStore = getNoteStore(noteId);

	function updateLabel(label: string) {
		$noteStore.mermaid = updateMermaidNode($noteStore.mermaid, {
			id: node.id,
			label
		});
	}
</script>

<div class="rounded-md p-4 bg-surface-800 space-y-2">
	<form class="space-y-2">
		<div class="space-y-1">
			<label for="label" class="label">
				<span>Label</span>
				<input
					class="input"
					type="text"
					id="label"
					bind:value={label}
					placeholder={node.label}
				/>
			</label>
		</div>
		<div class="justify-end flex">
			<button
				type="submit"
				class="btn variant-filled-primary"
				on:click={() => {
					modalStore.close();
					updateLabel(label);
				}}
			>
				Update
			</button>
		</div>
	</form>
	<div class="flex flex-col">
		<button
			class="btn variant-filled-surface"
			on:click={() => {
				modalStore.close();
				$noteStore.mermaid = addNewNode($noteStore.mermaid, node.id);
			}}
		>
			Add a new node
		</button>
	</div>
</div>
