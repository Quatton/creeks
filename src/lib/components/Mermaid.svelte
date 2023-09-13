<script lang="ts">
	import { sessions } from "$lib/stores/core";
	import type { CreekNote } from "$lib/types/core";
	import { mermaidParse, mermaidRender } from "$lib/utils/mermaid";
	import { modeCurrent } from "@skeletonlabs/skeleton";
	import { useCompletion } from "ai/svelte";
	import { onMount } from "svelte";
	import { derived, type Unsubscriber } from "svelte/store";
	import panzoom from "svg-pan-zoom";
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

	onMount(() => {
		if ($currentNote.mermaid === "") {
			genFlowchart();
		}
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
			}
		});
	}
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
