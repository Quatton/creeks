<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import type { CreekSession } from "$lib/types/core";
	import { sessions } from "$lib/stores/core";
	import { Markdown } from "tiptap-markdown";
	import type { defaultMarkdownSerializer } from "@tiptap/pm/markdown";
	let element: Element;
	let editor: InstanceType<typeof Editor>;

	export let note: CreekSession;

	onMount(() => {
		editor = new Editor({
			element: element,
			editorProps: {
				attributes: {
					class:
						"prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
				}
			},
			extensions: [
				StarterKit,
				Markdown.configure({
					html: true, // Allow HTML input/output
					tightLists: true, // No <p> inside <li> in markdown output
					tightListClass: "tight", // Add class to <ul> allowing you to remove <p> margins when tight
					bulletListMarker: "-", // <li> prefix in markdown output
					linkify: false, // Create links from "https://..." text
					breaks: true, // New lines (\n) in markdown input are converted to <br>
					transformPastedText: true, // Allow to paste markdown text in the editor
					transformCopiedText: true // Copied text is transformed to markdown
				})
			],
			content: note.content,
			onTransaction: ({ editor }) => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
				sessions.update((sessions) => {
					const index = sessions.findIndex((session) => session.id === note.id);
					sessions[index].content = editor.storage.markdown.getMarkdown();
					return sessions;
				});
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div bind:this={element} />
