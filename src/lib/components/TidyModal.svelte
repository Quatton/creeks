<script lang="ts">
	import { getModalStore } from "@skeletonlabs/skeleton";

	export let parent: any;
	let instruction = `Language: English
Audience: Private note for myself

- Should use markdown syntax, especially bullet points and headings`;

	const modalStore = getModalStore();

	function onSubmit() {
		$modalStore[0].response?.(instruction);
		modalStore.close();
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
			<div class="justify-end flex">
				<button type="submit" class="btn variant-filled-primary">
					Submit
				</button>
			</div>
		</form>
	</div>
{/if}
