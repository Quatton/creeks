<script lang="ts">
	import Disappearing from "$lib/components/Disappearing.svelte";
	import { currentSession, sessions } from "$lib/stores/core";
	import { disappearingStore } from "$lib/stores/disappearing";
	import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";

	import LucideTrash2 from "~icons/lucide/trash-2";
	import LucideTimer from "~icons/lucide/timer";

	const modalStore = getModalStore();

	import Writer from "./Writer.svelte";
	// import Tiptap from "$lib/components/Tiptap.svelte";
	import { cn } from "$lib/utils/cn";
	import { goto } from "$app/navigation";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";
	import { format, formatDuration, secondsToHours } from "date-fns";

	let writer: Writer;

	let time = 300;
	let timer: NodeJS.Timeout | null = null;

	// let tiptap: Tiptap;

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

			if (!session)
				return [
					...sessions,
					{
						title: $currentSession.title,
						content: $currentSession.content,
						createdAt: $currentSession.createdAt,
						id: $currentSession.id,
						mermaid: "",
						tidied: false
					}
				];

			// if it exists, update it
			return sessions.map((session) => {
				if (session.id === $currentSession?.id) {
					return {
						...session,
						title: $currentSession.title,
						content: $currentSession.content,
						createdAt: $currentSession.createdAt,
						id: $currentSession.id,
						mermaid: "",
						tidied: false
					};
				}
				return session;
			});
		});
		currentSession.set(null);
	}

	const modal: ModalSettings = {
		type: "confirm",
		title: "End session?",
		body: "Are you sure you want to end this session?",

		response: (response: boolean) => {
			if (response) {
				currentSession.update((session) => {
					if (!session) return null;
					return {
						...session,
						tidied: false
					};
				});
				const id = $currentSession?.id;
				if (!id) return;
				goto(`/notes/${id}`);
				toggleMode();
				saveAndEndSession();
			} else {
				// update to -1
				currentSession.update((session) => {
					if (!session) return null;
					return {
						...session,
						time: -1
					};
				});
			}
		}
	};

	const discardModal: ModalSettings = {
		type: "confirm",
		title: "Discard session?",
		body: "Are you sure you want to discard this session?",

		response: (response: boolean) => {
			if (response) {
				currentSession.set(null);
			}
		}
	};

	$: isSession = !!$currentSession;
	$: notEmpty = !!$currentSession?.content.trim();
	$: {
		if (isSession && !notEmpty && time !== -1)
			currentSession.update((session) => {
				if (!session) return null;
				return {
					...session,
					time: time
				};
			});
	}

	$: {
		// now let's time this up
		if (isSession && !timer)
			timer = setInterval(() => {
				currentSession.update((session) => {
					if (!session) return null;
					if (session.time === 0) {
						writer.pushAll();
						modalStore.trigger(modal);
					}
					return {
						...session,
						time: session.time - 1
					};
				});
			}, 1000);
	}

	$: {
		if (timer && $currentSession && $currentSession.time < 0)
			clearInterval(timer);
	}

	onMount(() => {
		return () => {
			if (timer) clearInterval(timer);
		};
	});
</script>

<svelte:head>
	<title>New</title>
	<meta name="description" content="Create a new note" />
</svelte:head>

<svelte:window
	on:keydown={(e) => {
		// if (e.altKey && e.key === "w" && $currentSession) {
		// 	e.preventDefault();
		// 	toggleMode();
		// }
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

	<div class="relative h-72 overflow-y-visible">
		<!-- {#if !$currentSession || $currentSession.mode !== "edit"} -->
		<Writer bind:this={writer} />
		{#each $disappearingStore as disappearing (disappearing.id)}
			<Disappearing setting={disappearing} className="text-3xl" />
		{/each}
		<!-- {:else if $currentSession.mode === "edit"}
			<div class="h-full overflow-y-auto">
				<Tiptap note={$currentSession} bind:this={tiptap} />
			</div>
		{/if} -->
	</div>

	<section class="space-x-1 flex justify-center items-center gap-2">
		{#if $currentSession}
			<button
				class="btn-icon-sm flex items-center justify-center"
				on:click={() => {
					modalStore.trigger(discardModal);
				}}
			>
				<LucideTrash2 class="w-4 h-4" />
			</button>
			{#if $currentSession.time >= 0}
				{@const hours = secondsToHours($currentSession.time)}
				{@const minutes = $currentSession.time / 60}
				{@const seconds = $currentSession.time % 60}
				{@const formatted = format(
					new Date(0, 0, 0, hours, minutes, seconds),
					hours > 0 ? "HH:mm:ss" : "mm:ss"
				)}
				<span in:fade={{ duration: 300 }}>{formatted}</span>
			{/if}
			<button
				class="chip variant-filled-error"
				in:fade={{ duration: 300 }}
				on:click={() => {
					modalStore.trigger(modal);
				}}
			>
				ESC | End session
			</button>
		{:else}
			<div
				class="w-fit items-center input-group grid-cols-[auto_auto]"
				in:fade={{ duration: 300 }}
			>
				<label class="label p-2" for="timer">
					<LucideTimer />
				</label>
				<select class="select" bind:value={time} id="timer">
					<option value={-1}>(Untimed)</option>
					<option value={180}>3 m</option>
					<option value={300} selected>5 m</option>
				</select>
			</div>
		{/if}
	</section>
</section>
