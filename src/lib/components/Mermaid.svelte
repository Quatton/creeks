<script lang="ts">
	import { sessions } from "$lib/stores/core";
	import type { CreekNote } from "$lib/types/core";
	import { mermaidParse, mermaidRender } from "$lib/utils/mermaid";
	import { modeCurrent } from "@skeletonlabs/skeleton";
	import { useCompletion } from "ai/svelte";
	import { onMount } from "svelte";
	import { derived, type Unsubscriber } from "svelte/store";
	export let note: CreekNote;

	const index = $sessions.findIndex((session) => session.id === note.id);
	const currentNote = derived(sessions, ($sessions) => {
		return $sessions[index];
	});

	let unsub: Unsubscriber = () => {};

	const { completion, complete } = useCompletion({
		api: "/api/mermaid"
	});

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
		mermaidParse($currentNote.mermaid).then((t) => {
			if (t)
				mermaidRender(
					{
						darkMode: !$modeCurrent
					},
					$currentNote.mermaid,
					"graph-div"
				).then(({ svg }) => {
					const mermaid = document.getElementById("mermaid");
					if (!mermaid) return;
					mermaid.innerHTML = svg;
				});
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

<div id="mermaid" />
