<script lang="ts">
	import Disappearing from "$lib/components/Disappearing.svelte";
	import { currentSession, sessions } from "$lib/stores/core";
	import { disappearingStore } from "$lib/stores/disappearing";
	import { modalStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import Result from "./Result.svelte";

	import Writer from "./Writer.svelte";
	import Tiptap from "$lib/components/Tiptap.svelte";
	import { cn } from "$lib/utils/cn";

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

<section class={cn("mx-auto p-4 container max-w-4xl space-y-1")}>
	<div class="text-center">
		{#if $currentSession}
			<strong>🎯{$currentSession.title}</strong>
		{:else}
			<strong>What's the goal of this session?</strong>
		{/if}
	</div>

	<div class="relative h-96 overflow-y-visible">
		{#if !$currentSession || $currentSession.mode !== "edit"}
			<Writer />
			{#each $disappearingStore as disappearing (disappearing.id)}
				<Disappearing setting={disappearing} className="text-3xl" />
			{/each}
		{:else if $currentSession.mode === "edit"}
			<div class="h-full overflow-y-auto">
				<Tiptap note={$currentSession} />
			</div>
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
		{#if $currentSession?.mode === "edit"}
			<button class="chip variant-filled-primary"> Alt+T | Tidy </button>
		{/if}
	</div>
</section>
