<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import type { CreekNote } from "$lib/types/core";
	import { currentSession, sessions } from "$lib/stores/core";
	import { Markdown } from "tiptap-markdown";
	let element: HTMLDivElement;
	let editor: InstanceType<typeof Editor>;

	export let note: CreekNote;
	const index = $sessions.findIndex((session) => session.id === note.id);
	const currentNote = derived(sessions, ($sessions) => {
		return $sessions.find((session) => session.id === note.id);
	});

	import { useCompletion } from "ai/svelte";
	import { cn } from "$lib/utils/cn";
	import { derived } from "svelte/store";
	import LucideSparkles from "~icons/lucide/sparkles";
	import {
		getModalStore,
		type ModalComponent,
		type ModalSettings
	} from "@skeletonlabs/skeleton";
	import TidyModal from "./TidyModal.svelte";

	const { completion, complete } = useCompletion({
		api: "/api/completion",
		onFinish: (_, completion) => {
			editor.commands.setContent(completion);
		}
	});

	const modalStore = getModalStore();
	const modal: ModalSettings = {
		title: "Tidy",
		type: "component",
		component: {
			ref: TidyModal
		},
		response: (instruction: string | boolean) => {
			if (typeof instruction === "string") tidy(instruction);
		}
	};

	onMount(() => {
		// convert

		// sessions.update((sessions) => {
		// 	return sessions.map((note) => {
		// 		const creekNote: CreekNote = {
		// 			content: note.content,
		// 			createdAt: note.createdAt,
		// 			id: note.id,
		// 			mermaid: note.mermaid ?? "",
		// 			title: note.title,
		// 			tidied: note.tidied ?? false
		// 		};

		// 		return creekNote;
		// 	});
		// });

		// onMount(async () => {

		const unsub = completion.subscribe((completion) => {
			if (completion.length > 0) editor.commands.setContent(completion);
		});

		editor = new Editor({
			element: element,
			editorProps: {
				attributes: {
					class: cn(
						"prose dark:prose-invert prose-sm sm:prose sm:max-w-3xl lg:prose-lg focus:outline-none prose-p:my-1 prose-li:my-0"
					)
				}
			},
			extensions: [
				StarterKit,
				Markdown.configure({
					html: true, // Allow HTML input/output
					// tightLists: true, // No <p> inside <li> in markdown output
					// tightListClass: "my-0", // Add class to <ul> allowing you to remove <p> margins when tight
					bulletListMarker: "-", // <li> prefix in markdown output
					linkify: true, // Create links from "https://..." text
					breaks: true, // New lines (\n) in markdown input are converted to <br>
					transformPastedText: true, // Allow to paste markdown text in the editor
					transformCopiedText: true // Copied text is transformed to markdown
				})
			],
			content: note.content,
			onTransaction: ({ editor }) => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
				if (index !== -1) {
					sessions.update((sessions) => {
						sessions[index].content = editor.storage.markdown.getMarkdown();
						return sessions;
					});
				} else {
					currentSession.update((session) => {
						if (session) {
							return {
								...session,
								content: editor.storage.markdown.getMarkdown()
							};
						} else {
							return session;
						}
					});
				}
			}
		});
		// editor.commands.selectAll();
		// editor
		// 	.chain()
		// 	.focus(editor.state.selection.to)
		// 	.setTextSelection({
		// 		from: editor.state.selection.to,
		// 		to: editor.state.selection.to
		// 	})
		// 	.run();

		return () => {
			unsub();
			if (editor) {
				editor.destroy();
			}
		};
	});
	export async function tidy(instruction: string) {
		editor.setEditable(false);
		const text = editor.storage.markdown.getMarkdown();

		const textWithInstruction = `[ORIGINAL TEXT]
${text}

[REVISE WITH ADDITIONAL INSTRUCTION]
${instruction}`;
		await complete(textWithInstruction);
		sessions.update((sessions) => {
			sessions[index].tidied = true;
			return sessions;
		});
		editor.setEditable(true);
	}
</script>

<!-- <svelte:window
// 	on:keydown={(e) => {
// 		if (e.key === "t" && e.altKey) {
// 			e.preventDefault();
// 			tidy();
// 		}
// 	}}
// /> -->

<div class="flex flex-col h-full gap-2">
	<div class="flex gap-2">
		<button
			class="btn btn-sm variant-ghost"
			on:click={() => {
				modalStore.trigger(modal);
			}}
		>
			<span>
				<LucideSparkles class="w-4 h-4" />
			</span>
			<span>Tidy</span>
		</button>
	</div>
	<div class="overflow-y-auto">
		<div bind:this={element} />
	</div>
</div>
