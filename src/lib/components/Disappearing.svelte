<script lang="ts">
	import { disappearingStore } from "$lib/stores/disappearing";
	import type { DisappearingSettings } from "$lib/types/disappearing";
	import { cn } from "$lib/utils/cn";
	import { onMount } from "svelte";
	import { cubicOut, quartIn, quartOut } from "svelte/easing";
	import { fly } from "svelte/transition";

	export let className = "";
	export let setting: DisappearingSettings;

	$: disappearingStore.remove(setting.id);
</script>

<div
	class={cn("absolute inset-0 select-none z-20", className)}
	out:fly={{
		y: -100,
		duration: setting.duration || 3000,
		easing: cubicOut
	}}
>
	{setting.text}
</div>
