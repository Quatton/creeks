<script lang="ts">
	import { currentSession, sessions } from "$lib/stores/core";
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton";

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
					blocks: []
				};
			}
			return {
				...session,
				blocks: [
					...session.blocks,
					{
						createdAt: new Date(),
						content: text
					}
				]
			};
		});
	}

	const modal: ModalSettings = {
		type: "confirm",
		title: "End session?",
		body: "Are you sure you want to end this session?",
		response: (response: boolean) => {
			if (response) {
				sessions.update((sessions) => {
					if (!sessions || !$currentSession) return [];
					return [...sessions, $currentSession];
				});
				currentSession.set(null);
			}
		}
	};
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (text.trim() === "") return;
			push(text);
			text = "";
		}
		if (e.key === "Escape") {
			e.preventDefault();
			// save and end session
			modalStore.trigger(modal);
		}
	}}
/>

<!-- svelte-ignore a11y-autofocus -->
<textarea
	class="w-full resize-none outline-none bg-transparent text-3xl"
	placeholder={$currentSession ? "Keep writing..." : "I want to write about..."}
	bind:value={text}
	autofocus
/>
