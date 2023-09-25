<svelte:options accessors />

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

	export let focus = false;

	let text = "";
	function push(text: string) {
		currentSession.update((session) => {
			if (!session) {
				return {
					id: crypto.randomUUID(),
					createdAt: new Date(),
					title: text,
					blocks: [],
					// content: "",
					record: false,
					time: -1
				};
			}
			return {
				...session,
				// content:
				// 	session.content.at(-1) === "\n"
				// 		? session.content + text
				// 		: session.content + "\n" + text
				blocks: [
					...session.blocks,
					{
						type: "text",
						createdAt: new Date(),
						content: text
					}
				]
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

	export function pushAll() {
		if (text.trim() === "") return;
		push(text);
		pushAnimate(text);
		text = "";
	}
</script>

<!-- svelte-ignore a11y-autofocus -->
<textarea
	class="p-0 absolute inset-0 resize-none outline-none focus:ring-0 border-none bg-transparent text-3xl z-40"
	placeholder={$currentSession ? "Keep writing..." : "I want to write about..."}
	bind:value={text}
	on:focus={() => {
		focus = true;
	}}
	on:blur={() => {
		focus = false;
	}}
/>
