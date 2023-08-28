<script lang="ts">
	import { currentSession, sessions } from "$lib/stores/core";
	import { disappearingStore } from "$lib/stores/disappearing";

	/**
	 * Logic:
	 *
	 * On first message, if no session, create one and set the title to that message.
	 *
	 * On subsequent messages, if no session, create one and set the title to that message.
	 * (But ask yourself why that would happen.)
	 *
	 * On subsequent messages, if session, append the message to the title.
	 */

	let text = "";

	function push(text: string) {
		currentSession.update((session) => {
			if (!session) {
				return {
					id: crypto.randomUUID(),
					createdAt: new Date(),
					title: text,
					mode: "flow",
					// blocks: [],
					content: ""
				};
			}
			return {
				...session,
				content:
					session.content.at(-1) === "\n"
						? session.content + text
						: session.content + "\n" + text
				// blocks: [
				// 	...session.blocks,
				// 	{
				// 		createdAt: new Date(),
				// 		content: text
				// 	}
				// ]
			};
		});
	}

	function pushAnimate(text: string) {
		const id = crypto.randomUUID();
		disappearingStore.add({
			id,
			text,
			duration: 3000
		});
	}
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (text.trim() === "") return;
			push(text);
			pushAnimate(text);
			text = "";
		}
	}}
/>

<!-- svelte-ignore a11y-autofocus -->
<textarea
	class="w-full resize-none outline-none bg-transparent text-3xl z-40 h-96"
	placeholder={$currentSession ? "Keep writing..." : "I want to write about..."}
	bind:value={text}
	autofocus
/>
