<script lang="ts">
	import { getNoteStore, sessions } from "$lib/stores/core";
	import type { CreekNote } from "$lib/types/core";
	import { mermaidParse, mermaidRender } from "$lib/utils/mermaid";
	import {
		modeCurrent,
		type ModalSettings,
		type PopupSettings,
		type ModalComponent,
		getModalStore
	} from "@skeletonlabs/skeleton";
	import { useCompletion } from "ai/svelte";
	import { onMount } from "svelte";
	import panzoom from "svg-pan-zoom";
	import MermaidModal from "./MermaidModal.svelte";
	import { get, type Unsubscriber } from "svelte/store";
	export let note: CreekNote;

	import LucideAxis3d from "~icons/lucide/axis-3d";
	import LucideLoader2 from "~icons/lucide/loader-2";

	const currentNote = getNoteStore(note.id);

	let unsub: Unsubscriber = () => {};
	const { completion, complete, stop, isLoading } = useCompletion({
		api: "/api/mermaid"
	});

	let mermaid: HTMLDivElement;
	let pzoom: typeof panzoom | undefined;

	let nodes: NodeListOf<SVGElement>;
	let edges: NodeListOf<SVGElement>;

	onMount(() => {
		if ($currentNote.mermaid === "") {
			genFlowchart();
		}
		return () => {
			unsub();
			nodes.forEach((node) => {
				node.removeEventListener("click", clickNode(node));
			});
		};
	});

	function genFlowchart() {
		unsub = completion.subscribe((completion) => {
			const result = completion.replace(/`/g, "");
			$currentNote.mermaid = result;
		});

		complete(`TITLE: ${$currentNote.title}
			CONTENT: ${$currentNote.content}
			`).then(() => {
			unsub();
		});
	}

	$: code = $currentNote.mermaid;
	$: {
		mermaidParse(code).then(async (t) => {
			if (t) {
				const { svg } = await mermaidRender(
					{
						darkMode: !$modeCurrent
					},
					code,
					"graph-div"
				);
				setupPanzoom();
				mermaid.innerHTML = svg;
				bindClicks();
			}
		});
	}

	const setupPanzoom = () => {
		pzoom?.destroy();
		pzoom = undefined;

		void Promise.resolve().then(() => {
			const { pan, zoom } = get(currentNote).mermaidConfig ?? {
				pan: undefined,
				zoom: undefined
			};
			pzoom = panzoom("#graph-div", {
				fit: true,
				center: true,
				beforePan: handlePanZoomChange,
				beforeZoom: handlePanZoomChange,
				controlIconsEnabled: true,
				zoomScaleSensitivity: 0.2
			});
			if (!!pan && !!zoom && Number.isFinite(zoom)) {
				pzoom.zoom(zoom);
				pzoom.pan(pan);
			}
		});
	};

	const handlePanZoomChange = () => {
		if (!pzoom) {
			return;
		}
		const pan = pzoom.getPan();
		const zoom = pzoom.getZoom();

		$currentNote.mermaidConfig = {
			pan,
			zoom
		};
	};

	function bindClicks() {
		nodes = document.querySelectorAll("g.node");
		nodes.forEach((node) => {
			node.classList.add("cursor-pointer");
			node.addEventListener("click", clickNode(node));
		});
	}

	const clickNode = (node: SVGElement) => () => {
		const elementId = node.id;
		// flowchart-[id]-###
		// can be buggy if id contains -
		const id = elementId.split("-").slice(1, -1).join("-");
		const label = node.querySelector("span.nodeLabel")?.innerHTML ?? "";

		modalStore.trigger(modalFn({ id, label }));
	};

	const modalStore = getModalStore();

	const modalComponent: (node: {
		id: string;
		label: string;
	}) => ModalComponent = (node) => {
		return {
			ref: MermaidModal,
			props: {
				node,
				noteId: $currentNote.id
			}
		};
	};

	const modalFn: (node: { id: string; label: string }) => ModalSettings = (
		node
	) => ({
		type: "component",
		component: modalComponent(node)
	});
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.altKey && event.key === "r") {
			genFlowchart();
		}
	}}
	on:resize={() => {
		if (pzoom) {
			pzoom.resize();
		}
	}}
/>

<div class="relative grow flex flex-col">
	<div bind:this={mermaid} class="grow [&_>_#graph-div]:h-full overflow-auto" />

	<div class="flex gap-2 items-center">
		<button
			class="btn-icon"
			on:click={() => {
				// graph the first line of mermaid
				const firstLine = $currentNote.mermaid.split("\n")[0];

				// change TD to LR and vice versa
				const newLine = firstLine.includes("TD")
					? firstLine.replace("TD", "LR")
					: firstLine.replace("LR", "TD");

				$currentNote.mermaid =
					newLine + "\n" + $currentNote.mermaid.split("\n").slice(1).join("\n");
			}}
		>
			<LucideAxis3d class="w-6 h-6" />
		</button>

		{#if isLoading}
			<LucideLoader2 class="w-6 h-6 animate-spin" />
			<span>Generating...</span>
		{/if}
	</div>
</div>
