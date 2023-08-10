<script lang="ts">
	import Disappearing from "$lib/components/Disappearing.svelte";
	import { currentSession, sessions } from "$lib/stores/core";
	import { disappearingStore } from "$lib/stores/disappearing";
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import Result from "./Result.svelte";

	import Writer from "./Writer.svelte";
	import Tiptap from "$lib/components/Tiptap.svelte";

	function toggleMode() {
		currentSession.update((session) => {
			if (!session) return null;
			return {
				...session,
				mode: session.mode === "edit" ? "flow" : "edit"
			};
		});
	}

	function saveAndEndSession() {
		sessions.update((sessions) => {
			if (!sessions || !$currentSession) return [];
			// find the session by id if it exists
			const session = sessions.find(
				(session) => session.id === $currentSession?.id
			);

			if (!session) return [...sessions, $currentSession];

			// if it exists, update it
			return sessions.map((session) => {
				if (session.id === $currentSession?.id) {
					return $currentSession;
				}
				return session;
			});
		});
		currentSession.set(null);
		currentSession.update((session) => {
			if (!session) return null;
			return {
				...session,
				done: true
			};
		});
	}

	const modal: ModalSettings = {
		type: "confirm",
		title: "End session?",
		body: "Are you sure you want to end this session?",
		response: (response: boolean) => {
			if (response) {
				if ($currentSession?.mode === "flow") {
					toggleMode();
				}
				if ($currentSession?.mode === "edit") {
					saveAndEndSession();
				}
			}
		}
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<svelte:window
	on:keydown={(e) => {
		if (e.altKey && e.key === "w" && $currentSession) {
			e.preventDefault();
			toggleMode();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			// save and end session
			modalStore.trigger(modal);
		}
	}}
/>

<section class="mx-auto p-4 container space-y-1">
	{#if $currentSession}
		<h1 class="h1">{$currentSession.title}</h1>
		<!-- {#each $currentSession.blocks as block}
				<p>{block.content}</p>
			{/each} -->
	{:else}
		<p>What's the goal of this session?</p>
	{/if}

	<div class="relative h-96 overflow-y-auto">
		{#if !$currentSession || $currentSession.mode !== "edit"}
			<Writer />
			{#each $disappearingStore as disappearing (disappearing.id)}
				<Disappearing setting={disappearing} className="text-3xl" />
			{/each}
		{:else if $currentSession.mode === "edit"}
			<Tiptap note={$currentSession} />
		{/if}
	</div>

	<div class="space-x-1">
		<button class="chip variant-filled"> Enter | Flush </button>
		<button
			class="chip variant-filled-error"
			on:click={() => {
				modalStore.trigger(modal);
			}}
		>
			ESC | End session
		</button>
		<button class="chip variant-filled-primary" on:click={toggleMode}>
			Alt+W | Toggle mode
		</button>
	</div>
</section>
