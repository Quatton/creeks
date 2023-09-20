<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import type { CreekNote } from "$lib/types/core";
	import { getNoteStore, sessions } from "$lib/stores/core";
	import { Markdown } from "tiptap-markdown";
	let element: HTMLDivElement;
	let editor: InstanceType<typeof Editor>;

	export let note: CreekNote;
	const currentNote = getNoteStore(note.id);

	import { useCompletion } from "ai/svelte";
	import { cn } from "$lib/utils/cn";
	import { derived } from "svelte/store";

	import LucideSparkles from "~icons/lucide/sparkles";
	import LucideCopy from "~icons/lucide/copy";
	import LucideTrash2 from "~icons/lucide/trash-2";

	import {
		getModalStore,
		popup,
		type ModalComponent,
		type ModalSettings
	} from "@skeletonlabs/skeleton";
	import TidyModal from "./TidyModal.svelte";
	import { goto } from "$app/navigation";
	import { format } from "date-fns";
	import CombineWithModal from "./CombineWithModal.svelte";

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
			ref: TidyModal,
			props: {
				currentNote: $currentNote
			}
		},

		response: (
			payload:
				| {
						instruction: string;
				  }
				| false
		) => {
			if (!payload) return;
			const { instruction } = payload;
			tidy(instruction);
		}
	};

	async function triggerCopyModalHelper() {
		const id = crypto.randomUUID();

		await new Promise<void>((resolve, _) => {
			modalStore.trigger({
				title: "Combine",
				type: "component",
				component: {
					ref: CombineWithModal,
					props: {
						currentNote: $currentNote
					}
				},
				response(payload: { title: string; combineWith: string[] } | false) {
					if (!payload) return;
					const { title, combineWith } = payload;
					const allNotes = $sessions
						.filter((session) =>
							[...combineWith, $currentNote.id].includes(session.id)
						)
						.toSorted(
							(a, b) =>
								new Date(a.createdAt).getTime() -
								new Date(b.createdAt).getTime()
						);

					const combinedContent = allNotes
						.map(
							(note) => `# ${note.title}
> ${format(new Date(note.createdAt), "yyyy MMM dd - HH:mm")}

${note.content}`
						)
						.join("\n\n");

					const combinedMermaid = allNotes
						.map((note) => note.mermaid)
						.join("\n\n");

					sessions.update((sessions) => {
						return [
							...sessions,
							{
								title,
								content: combinedContent,
								createdAt: new Date(),
								id: crypto.randomUUID(),
								mermaid: combinedMermaid,
								tidied: false
							}
						];
					});

					resolve();
				}
			});
		});

		await goto(`/notes/${id}`);
	}

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
				$currentNote.content = editor.storage.markdown.getMarkdown();
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

[ADDITIONAL INSTRUCTION]
${instruction}
- Don't have to include [REVISED TEXT] in your response`;
		await complete(textWithInstruction);
		$currentNote.tidied = true;
		editor.setEditable(true);
	}

	async function deleteThis() {
		const res = await new Promise<boolean>((response, _) =>
			modalStore.trigger({
				title: "Deleting: " + note.title,
				body: "This will <strong>instantly</strong> delete the note!",
				type: "confirm",
				response
			})
		);

		if (res) {
			await goto("/notes");
			sessions.update((sessions) => {
				return sessions.filter((session) => session.id !== note.id);
			});
		}
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

<div class="flex flex-col h-full gap-2 p-4">
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
		<button class="btn btn-sm variant-ghost" on:click={triggerCopyModalHelper}>
			<span>
				<LucideCopy class="w-4 h-4" />
			</span>
			<span>Make a copy</span>
		</button>
		<button
			class="btn btn-sm variant-ghost"
			on:click|preventDefault={deleteThis}
		>
			<span>
				<LucideTrash2 class="w-4 h-4" />
			</span>
			<span>Delete</span>
		</button>
	</div>
	<div class="overflow-y-auto">
		<div bind:this={element} />
	</div>
</div>
