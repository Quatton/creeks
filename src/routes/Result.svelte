<script>
	import { currentSession } from "$lib/stores/core";
	import { onMount } from "svelte";
	let text = "";

	onMount(() => {
		text = $currentSession?.content ?? "";
	});

	$: currentSession.update((session) => {
		if (text === "") {
			return session;
		}
		if (session) {
			return {
				...session,
				content: text
			};
		} else {
			return session;
		}
	});
</script>

{#if $currentSession}
	<div class="h-full overflow-y-auto">
		<!-- svelte-ignore a11y-autofocus -->
		<textarea
			bind:value={text}
			class="absolute inset-0 resize-none outline-none rounded-md p-4 z-20"
			autofocus
		/>
	</div>
{/if}
