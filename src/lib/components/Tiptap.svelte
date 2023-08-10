<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import type { CreekSession } from "$lib/types/core";
	import { currentSession, sessions } from "$lib/stores/core";
	import { Markdown } from "tiptap-markdown";
	import type { defaultMarkdownSerializer } from "@tiptap/pm/markdown";
	let element: HTMLDivElement;
	let editor: InstanceType<typeof Editor>;

	export let note: CreekSession;

	onMount(() => {
		editor = new Editor({
			element: element,
			editorProps: {
				attributes: {
					class:
						"prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none prose-p:my-1 prose-li:my-0"
				}
			},
			extensions: [
				StarterKit,
				Markdown.configure({
					html: true, // Allow HTML input/output
					// tightLists: true, // No <p> inside <li> in markdown output
					// tightListClass: "my-0", // Add class to <ul> allowing you to remove <p> margins when tight
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
				const index = $sessions.findIndex((session) => session.id === note.id);
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
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div bind:this={element} />
