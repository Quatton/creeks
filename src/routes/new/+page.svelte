<script lang="ts">
	import Disappearing from "$lib/components/Disappearing.svelte";
	import { currentSession, sessions } from "$lib/stores/core";
	import { disappearingStore } from "$lib/stores/disappearing";
	import {
		getModalStore,
		SlideToggle,
		type ModalSettings
	} from "@skeletonlabs/skeleton";

	import LucideTrash2 from "~icons/lucide/trash-2";
	import LucideTimer from "~icons/lucide/timer";

	import MdiMicrophoneOff from "~icons/mdi/microphone-off";

	const modalStore = getModalStore();

	import Writer from "./Writer.svelte";
	// import Tiptap from "$lib/components/Tiptap.svelte";
	import { cn } from "$lib/utils/cn";
	import { goto } from "$app/navigation";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";
	import { format, formatDuration, secondsToHours } from "date-fns";
	import { flip } from "svelte/animate";
	import type { PageData } from "./$types";
	import { dev } from "$app/environment";
	import AudioRecording from "$lib/components/AudioRecording.svelte";
	import { get, type Readable } from "svelte/store";
	import type { CreekBlock, CreekSession } from "$lib/types/core";

	let writer: Writer;
	let audioRecorder: AudioRecording;
	let snapshot: CreekSession | null = null;

	let time = 300;
	let record = true;
	let timer: NodeJS.Timer | null = null;

	async function saveAndEndSession() {
		snapshot = get(currentSession);
		if (!snapshot) return;

		await new Promise<void>((resolve) =>
			setTimeout(() => {
				currentSession.set(null);
				resolve();
			}, 0)
		);

		const blocks = await (async () => {
			if (!snapshot.record) return snapshot.blocks;

			try {
				const res = await fetch("/api/whisper", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						session: snapshot
					})
				});

				if (!res.ok) {
					return snapshot.blocks;
				}

				const { blocks: newBlocks } = await res.json();

				return newBlocks as CreekBlock[];
			} catch (e) {
				console.error(e);
				return snapshot.blocks;
			}
		})();

		sessions.update((sessions) => {
			if (!sessions || !snapshot) return [];
			// find the session by id if it exists
			const session = sessions.find((session) => session.id === snapshot?.id);

			/** convert blocks to content */
			const content = blocks
				.filter((block) => block.type === "text")
				.map((block) => block.content)
				.join("\n");

			if (!session)
				return [
					...sessions,
					{
						title: snapshot.title,
						// content: snapshot.content,
						content,
						createdAt: snapshot.createdAt,
						id: snapshot.id,
						mermaid: "",
						tidied: false
					}
				];

			return sessions.map((session) => {
				if (session.id === snapshot?.id) {
					return {
						...session,
						title: snapshot.title,
						content,
						createdAt: snapshot.createdAt,
						id: snapshot.id,
						mermaid: "",
						tidied: false
					};
				}
				return session;
			});
		});

		snapshot = null;
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
						...session
					};
				});
				const id = $currentSession?.id;
				if (!id) return;
				if ($currentSession?.record) {
					audioRecorder.pushAudio(true);
				}
				setTimeout(async () => {
					await saveAndEndSession();
					await goto(`/local/${id}`);
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
				if ($currentSession?.record) audioRecorder.stopRecording();
				currentSession.set(null);
			}
		}
	};

	$: isSession = !!$currentSession;
	$: notEmpty = $currentSession && $currentSession.blocks.length > 0;
	$: {
		if (isSession && !notEmpty && time !== -1)
			currentSession.update((session) => {
				if (!session) return null;
				return {
					...session,
					time: time,
					record
				};
			});
	}

	$: {
		if (timer && $currentSession && $currentSession.time < 0) {
			clearInterval(timer);
			timer = null;
		}
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
		if (e.key === "Enter") {
			if (!writer.focus) return;
			e.preventDefault();
			if (record) {
				if (!$currentSession && !timer) {
					console.log("start?");
					audioRecorder.startRecording();
					timer = setInterval(() => {
						currentSession.update((session) => {
							if (!session) return null;
							if (session.time === 0) {
								if ($currentSession?.record) {
									audioRecorder.pushAudio();
									audioRecorder.stopRecording();
								}
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
			}
			if ($currentSession && $currentSession.record) audioRecorder.pushAudio();
			setTimeout(() => {
				writer.pushAll();
			}, 10);
		}

		if (e.key === "Escape") {
			e.preventDefault();
			// save and end session
			modalStore.trigger(modal);
		}
	}}
/>

<section class={cn("mx-auto p-4 container max-w-4xl space-y-1")}>
	<div class="flex gap-2 justify-center items-center">
		<div class="text-center">
			{#if $currentSession}
				<strong>🎯{$currentSession.title}</strong>
			{:else}
				<strong>What's the goal of this session?</strong>
			{/if}
		</div>

		<span in:fade={{ duration: 300 }}>
			<AudioRecording
				audioTrackConstraints={{
					echoCancellation: true,
					noiseSuppression: true
				}}
				bind:this={audioRecorder}
			/>
		</span>
	</div>

	<div class="relative h-72 overflow-y-visible">
		{#if !snapshot}
			<Writer bind:this={writer} />
			{#each $disappearingStore as disappearing (disappearing.id)}
				<Disappearing setting={disappearing} className="text-3xl" />
			{/each}
		{:else}
			<div class="h-full w-full grid place-content-center gap-4">
				<h2 class="h2">Transcribing your notes...</h2>
				<p class="p text-center">
					This may take a while. <br /> Do not close this tab.
				</p>
			</div>
		{/if}
	</div>

	<div class="space-x-1 flex justify-center items-center gap-2">
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
			<SlideToggle
				id="record"
				name="record"
				bind:checked={record}
				size="sm"
				active="bg-primary-500"
			>
				{#if !dev || record}
					<label for="record" in:fade={{ duration: 300 }}>
						<span>Type-And-Speak</span>
						<span class="ml-1 chip variant-filled-primary">NEW</span>
					</label>
				{/if}
			</SlideToggle>

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
	</div>
</section>
