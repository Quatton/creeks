<script lang="ts">
	import { sessions } from "$lib/stores/core";
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
	import { derived, type Unsubscriber } from "svelte/store";
	import panzoom from "svg-pan-zoom";
	import MermaidModal from "./MermaidModal.svelte";
	export let note: CreekNote;

	const index = $sessions.findIndex((session) => session.id === note.id);
	const currentNote = derived(sessions, ($sessions) => {
		return $sessions[index];
	});

	let unsub: Unsubscriber = () => {};
	const { completion, complete } = useCompletion({
		api: "/api/mermaid"
	});

	let mermaid: HTMLDivElement;
	// let pzoom: typeof panzoom | undefined;
	let initPanzoom = false;

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
		unsub();
		unsub = completion.subscribe((completion) => {
			const result = completion.replace(/`/g, "");

			sessions.update((sessions) => {
				if (index === -1) return sessions;
				sessions[index] = {
					...sessions[index],
					mermaid: result
				};

				return sessions;
			});
		});

		complete(`TITLE: ${$currentNote.title}
			CONTENT: ${$currentNote.content}
			`).then(() => {
			unsub();
		});
	}

	$: {
		mermaidParse($currentNote.mermaid).then(async (t) => {
			if (t) {
				const { svg } = await mermaidRender(
					{
						darkMode: !$modeCurrent
					},
					$currentNote.mermaid,
					"graph-div"
				);
				mermaid.innerHTML = svg;
				if (!initPanzoom) {
					panzoom("#graph-div", {
						fit: true,
						center: true,
						controlIconsEnabled: true,
						zoomScaleSensitivity: 0.2
					});
				}
				bindClicks();
			}
		});
	}

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
				node
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
/>

<div
	bind:this={mermaid}
	class="h-full w-full [&_>_#graph-div]:h-full [&_>_#graph-div]:w-full"
/>
