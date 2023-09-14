<script lang="ts">
	import Disappearing from "$lib/components/Disappearing.svelte";
	import { disappearingStore } from "$lib/stores/disappearing";
	import { onMount } from "svelte";

	let text = "";
	let index = 0;
	let jndex = 0;
	let timeout: NodeJS.Timeout;

	let texts = [
		"Unclog your mind and let your thoughts flow.",
		"Keep writing and don't hesitate for even a second.",
		"We'll take care of the rest."
	];

	/**
	 * Logic:
	 *
	 * 1. Start from index = 0
	 * 2. Keep adding the next character (texts[index][jndex]) to the text, delay 50ms
	 * 3. If reaches the end, delay 500ms, then flush the text (setting it to "")
	 * 4. Add the text to the disappearing store (keep in mind that the text is already "" so you should use the texts[index])
	 * 5. Increment the index and reset the jndex to 0
	 * 6. If index reaches texts.length, reset everything to 0 and delay 500ms
	 */

	// if next character available increment jndex after 50ms

	$: text = texts[index].slice(0, jndex + 1);
	$: if (jndex < texts[index].length) {
		setTimeout(() => {
			jndex++;
		}, 50);
	} else {
		setTimeout(async () => {
			if (index === texts.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}

			flush(text);
			text = "";
			index = (index + 1) % texts.length;
			jndex = 0;
		}, texts[index].length * 10 + 500);
	}

	function flush(text: string) {
		disappearingStore.add({
			id: index.toString(),
			text,
			duration: 3000
		});
	}

	onMount(() => {
		return () => {
			clearTimeout(timeout);
		};
	});
</script>

<section class="mx-auto p-4 container max-w-4xl space-y-1">
	<article>
		<h1
			class="text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 font-bold"
		>
			Creeks
		</h1>
		<h3 class="h2 text-secondary-400-500-token">
			Unstuck your life with 5-minute <br class="sm:hidden" /> free-writing
		</h3>
		<div class="mt-12 relative h-24 overflow-y-visible">
			{#each $disappearingStore as disappearing}
				<Disappearing
					setting={disappearing}
					className="text-3xl text-primary-300-600-token"
				/>
			{/each}
			<textarea
				class="p-0 text-primary-400-500-token w-full resize-none outline-none border-none bg-transparent text-3xl z-40 h-full"
				bind:value={text}
				disabled
			/>
		</div>
		<div class="flex justify-center">
			<a href="/new" class="btn variant-filled-primary">Try it out</a>
		</div>
	</article>
</section>
