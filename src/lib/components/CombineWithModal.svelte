<script lang="ts">
	import type { CreekNote, SharedNote } from "$lib/types/core";
	import { getModalStore } from "@skeletonlabs/skeleton";

	import LucideX from "~icons/lucide/x";
	import LucidePlusSquare from "~icons/lucide/plus-square";
	import { sessions } from "$lib/stores/core";

	export let parent: any;
	export let currentNote: CreekNote | SharedNote;

	let combineWith: string[] = [];
	let title = "Copy of " + currentNote.title;
	let next = "";

	let filteredSessions: CreekNote[] = [];

	function onSubmit() {
		$modalStore[0].response?.({ title, combineWith });
		modalStore.close();
	}

	const modalStore = getModalStore();

	$: {
		const regex = new RegExp(
			`${next.toLowerCase().split("").join(".*")}`,
			`gi`
		);

		filteredSessions = $sessions.filter((session) => {
			return (
				regex.test(session.title) &&
				![...combineWith, currentNote.id].includes(session.id)
			);
		});
	}
</script>

{#if $modalStore[0]}
	<div class="bg-surface-100-800-token w-modal">
		<form on:submit|preventDefault={onSubmit} class="p-4 space-y-2">
			<label for="title" class="label">
				<span>Title</span>
				<input
					type="text"
					id="title"
					bind:value={title}
					class="input"
					placeholder="Title"
				/>
			</label>
			<label for="combineWith" class="label">
				<span>Combine with other notes</span>
				<div class="bg-surface-50-900-token p-2 rounded">
					<div class="flex gap-2 flex-wrap">
						{#each combineWith as sessionId}
							{@const title =
								$sessions.find((session) => session.id === sessionId)?.title ??
								"(Not found)"}
							<div class="chip variant-soft-surface">
								<span>{title}</span>
								<button
									type="button"
									class="btn-icon-sm"
									on:click={() => {
										combineWith = combineWith.filter((id) => id !== sessionId);
									}}
								>
									<LucideX class="w-4 h-4" />
								</button>
							</div>
						{/each}
						<input
							type="text"
							bind:value={next}
							class="flex-1 outline-none bg-transparent p-0 border-none focus:ring-0"
						/>
					</div>
				</div>
				<div class="h-48 overflow-y-auto bg-surface-50-900-token rounded">
					<dl class="list-dl p-1">
						{#each filteredSessions as session}
							<div class="bg-surface-200-700-token flex">
								<dt class="w-24 overflow-x-clip">{session.title}</dt>
								<dd class="flex-1">{session.content.slice(0, 32) + "..."}</dd>
								<button
									class="btn-icon-sm"
									on:click|preventDefault={() => {
										combineWith = [...combineWith, session.id];
									}}
								>
									<span>
										<LucidePlusSquare class="w-4 h-4" />
									</span>
								</button>
							</div>
						{/each}
					</dl>
				</div>
			</label>
			<div class="justify-end flex gap-2">
				<button
					type="button"
					class="btn variant-ghost"
					on:click={() => {
						modalStore.close();
					}}
				>
					Cancel
				</button>
				<button type="submit" class="btn variant-filled-primary">
					Submit
				</button>
			</div>
		</form>
	</div>
{/if}
