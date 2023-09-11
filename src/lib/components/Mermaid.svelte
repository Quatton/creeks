<script lang="ts">
	import { sessions } from "$lib/stores/core";
	import type { CreekNote } from "$lib/types/core";
	import { mermaidRender } from "$lib/utils/mermaid";
	import { modeCurrent } from "@skeletonlabs/skeleton";
	import { onMount } from "svelte";
	export let note: CreekNote;

	const index = $sessions.findIndex((session) => session.id === note.id);
	const currentNote = $sessions[index];

	onMount(() => {
		if (note.mermaid === "")
			sessions.update((sessions) => {
				if (index === -1) return sessions;
				sessions[index] = {
					...sessions[index],
					mermaid: "graph TD\nA-->B"
				};

				return sessions;
			});
	});

	$: {
		mermaidRender(
			{
				darkMode: !$modeCurrent
			},
			currentNote.mermaid,
			"graph-div"
		).then(({ svg }) => {
			const mermaid = document.getElementById("mermaid");
			if (!mermaid) return;
			mermaid.innerHTML = svg;
		});
	}
</script>

<div id="mermaid" />
