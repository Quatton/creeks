<script lang="ts">
	import { getNoteStore } from "$lib/stores/core";
	import { addNewNode, updateMermaidNode } from "$lib/utils/mermaid";
	import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";

	import LucidePlusSquare from "~icons/lucide/plus-square";
	import LucideGitBranchPlus from "~icons/lucide/git-branch-plus";
	import LucideTrash2 from "~icons/lucide/trash-2";
	import LucideBomb from "~icons/lucide/bomb";
	import LucideHelpingHand from "~icons/lucide/helping-hand";

	import { useCompletion } from "ai/svelte";

	export let node: {
		id: string;
		label: string;
	};

	export let parent: any;
	export let noteId: string;

	let label = node.label;

	const modalStore = getModalStore();
	const noteStore = getNoteStore(noteId);

	const branchSubmodal: ModalSettings = {
		body: "Anything to ask for specifically?",
		type: "prompt",
		value: "Could you elaborate on that?",
		valueAttr: { type: "text" },
		response(r: string) {
			if (!r) return;
			$modalStore[1].response?.({
				action: "branch",
				prompt: `${$noteStore.mermaid}

node to branch from: ${node.id}("${node.label}")
additional instruction: ${r}`,
				meta: r
			});
			modalStore.clear();
		}
	};

	const askSubmodal: ModalSettings = {
		body: "Any specific instruction?",
		type: "prompt",
		value: "Guide me what to write next",
		valueAttr: { type: "text" },
		response(r: string) {
			if (!r) return;
			$modalStore[1].response?.({
				action: "ask",
				prompt: `${$noteStore.mermaid}

node to ask: ${node.id}("${node.label}")
additional instruction: ${r}`,
				meta: r
			});
			modalStore.clear();
		}
	};

	function updateLabel(label: string) {
		$noteStore.mermaid = updateMermaidNode($noteStore.mermaid, {
			id: node.id,
			label
		});
	}

	function deleteNode() {
		// this will include every line that has either
		// nodeId (and space or nothing after it, other wise it has to satisfy the next one)
		// nodeId("label")
		// then capture the entire line
		const regex = new RegExp(
			`(?:\\n)?(?:\\s\\w+)?(?:\\s-->.*)?\\s${node.id}\\b.*`,
			"g"
		);

		$noteStore.mermaid = $noteStore.mermaid.replace(regex, "");
	}

	function clearNode() {
		// same as deleteNode but keep the node itself
		// only delete the lines that has nodeId
		const regex = new RegExp(`(?:\\n)?\\s${node.id}\\s.*`, "g");

		$noteStore.mermaid = $noteStore.mermaid.replace(regex, "");
	}
</script>

<div class="rounded-md p-4 bg-surface-800 w-modal space-y-2">
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
	<div class="flex flex-col gap-1">
		<button
			class="btn variant-filled-surface"
			on:click={() => {
				modalStore.close();
				$noteStore.mermaid = addNewNode($noteStore.mermaid, node.id);
			}}
		>
			<span>
				<LucidePlusSquare class="w-4 h-4" />
			</span>
			<span>Add a new node</span>
		</button>
		<button
			class="btn variant-filled-surface"
			on:click={() => {
				modalStore.update((modals) => [branchSubmodal, ...modals]);
			}}
		>
			<span>
				<LucideGitBranchPlus class="w-4 h-4" />
			</span>
			<span
				>Branch a subgraph
				<span class="chip variant-soft-primary">AI</span>
			</span>
		</button>
		<button
			class="btn variant-filled-surface"
			on:click={() => {
				modalStore.update((modals) => [askSubmodal, ...modals]);
			}}
		>
			<span>
				<LucideHelpingHand class="w-4 h-4" />
			</span>
			<span
				>Guide me what to write next
				<span class="chip variant-soft-primary">AI</span>
			</span>
		</button>
		<button
			class="btn variant-filled-surface"
			on:click={() => {
				modalStore.close();
				deleteNode();
			}}
		>
			<span>
				<LucideTrash2 class="w-4 h-4" />
			</span>
			<span>Delete this node</span>
		</button>
		<button
			class="btn variant-filled-surface"
			on:click={() => {
				modalStore.close();
				clearNode();
			}}
		>
			<span>
				<LucideBomb class="w-4 h-4" />
			</span>
			<span>Clear this node</span>
		</button>
	</div>
</div>
