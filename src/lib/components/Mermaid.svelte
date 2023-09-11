<script lang="ts">
	import type { CreekNote } from "$lib/types/core";
	import { mermaidRender } from "$lib/utils/mermaid";
	import { onMount } from "svelte";
	export let note: CreekNote;

	let pre = `flowchart TD:
  goal("Test") -->|Test| action("Test")
  `;
</script>

<div id="mermaid">{pre}</div>
