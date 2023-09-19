<script lang="ts">
	import { sessions } from "$lib/stores/core";
	import type { CreekNote, CreekSession } from "$lib/types/core";
	import {
		getModalStore,
		popup,
		type PopupSettings
	} from "@skeletonlabs/skeleton";

	import LucideX from "~icons/lucide/x";
	import LucidePlusSquare from "~icons/lucide/plus-square";

	export let parent: any;
	export let currentNote: CreekNote;

	let instruction = `Language: English
Audience: Private note for myself

- Should use markdown syntax, especially bullet points and headings`;
	let combineWith: string[] = [];

	let next = "";

	const modalStore = getModalStore();

	function onSubmit() {
		$modalStore[0].response?.({ instruction, combineWith });
		modalStore.close();
	}

	const searchCombobox: PopupSettings = {
		event: "focus-click",
		target: "searchCombobox",
		placement: "bottom"
		// closeQuery: '.listbox-item'
	};

	let filteredSessions: CreekNote[] = [];

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
	<div class="bg-surface-800 w-modal">
		<form on:submit|preventDefault={onSubmit} class="p-4 space-y-2">
			<h2>Psst... Any additional instructions?</h2>
			<div class="space-y-1">
				<label for="instruction" class="label">
					<span>Instruction</span>
					<textarea
						class="textarea"
						rows="6"
						id="instruction"
						bind:value={instruction}
						placeholder="Language: English
Audience: Private note for myself

- Should use markdown syntax, especially bullet points and headings"
					/>
				</label>
			</div>
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
							use:popup={searchCombobox}
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
