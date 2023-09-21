<script lang="ts">
	import { onMount } from "svelte";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import type { CreekNote, SharedNote } from "$lib/types/core";
	import { getNoteStore, sessions } from "$lib/stores/core";
	import { Markdown } from "tiptap-markdown";
	let element: HTMLDivElement;
	let editor: InstanceType<typeof Editor>;

	export let folder: "local" | "shared" = "local";
	export let note: CreekNote | SharedNote;

	const currentNote = folder === "local" ? getNoteStore(note.id) : null;

	import { useCompletion } from "ai/svelte";
	import { cn } from "$lib/utils/cn";
	import { derived } from "svelte/store";

	import LucideSparkles from "~icons/lucide/sparkles";
	import LucideCopy from "~icons/lucide/copy";
	import LucideTrash2 from "~icons/lucide/trash-2";
	import LucideShare2 from "~icons/lucide/share-2";
	import LucideArrowUpRight from "~icons/lucide/arrow-up-right";

	import {
		getModalStore,
		type ModalSettings,
		clipboard
	} from "@skeletonlabs/skeleton";
	import TidyModal from "./TidyModal.svelte";
	import { goto, invalidateAll } from "$app/navigation";
	import { format } from "date-fns";
	import CombineWithModal from "./CombineWithModal.svelte";
	import { supabase } from "$lib/supabase/client";
	import { page } from "$app/stores";
	import SignInModal from "./SignInModal.svelte";
	import type { Session } from "@supabase/supabase-js";

	const session = derived(page, ($page) => $page.data.session);

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
						currentNote: $currentNote ?? note
					}
				},
				response(payload: { title: string; combineWith: string[] } | false) {
					if (!payload) return;
					const { title, combineWith } = payload;
					let allNotes: (CreekNote | SharedNote)[] = $sessions
						.filter((session) => combineWith.includes(session.id))
						.toSorted(
							(a, b) =>
								new Date(a.createdAt).getTime() -
								new Date(b.createdAt).getTime()
						);

					allNotes = [$currentNote ? $currentNote : note, ...allNotes];

					const combinedContent = `${allNotes
						.map(
							(note) => `# ${note.title}
> ${format(new Date(note.createdAt), "yyyy MMM dd - HH:mm")}

${note.content}`
						)
						.join("\n\n")}`;

					// const combinedMermaid = [...allNotes, note]
					// 	.map((note) => note.mermaid)
					// 	.join("\n\n");

					sessions.update((sessions) => {
						return [
							...sessions,
							{
								title,
								content: combinedContent,
								createdAt: new Date(),
								id,
								mermaid: "",
								tidied: false
							}
						];
					});

					resolve();
				}
			});
		});

		await goto(`/local`);
		await goto(`/local/${id}`);
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
				if (!$currentNote) return;
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
		if (folder === "shared") editor.setEditable(false);

		return () => {
			unsub();
			if (editor) {
				editor.destroy();
			}
		};
	});
	export async function tidy(instruction: string) {
		if (folder === "shared") return;

		editor.setEditable(false);
		const text = editor.storage.markdown.getMarkdown();

		const textWithInstruction = `[ORIGINAL TEXT]
${text}

[ADDITIONAL INSTRUCTION]
${instruction}
- Don't have to include [REVISED TEXT] in your response`;
		await complete(textWithInstruction);
		editor.setEditable(true);
	}

	async function deleteThis() {
		if (!currentNote) return;

		const res = await new Promise<boolean>((response, _) =>
			modalStore.trigger({
				title: "Deleting: " + note.title,
				body: "This will <strong>instantly</strong> delete the note!",
				type: "confirm",
				response
			})
		);

		if (res) {
			await goto("/local");
			sessions.update((sessions) => {
				return sessions.filter((session) => session.id !== note.id);
			});
		}
	}

	async function shareNote() {
		if (!$currentNote) return;

		if ("tidied" in $currentNote) {
			const { tidied, ...note } = $currentNote;
			$currentNote = note;
		}

		const { id, mermaidConfig, createdAt, ...note } = $currentNote;

		if (!$session) {
			await new Promise<Session | null>((response, _) =>
				modalStore.trigger({
					type: "component",
					component: {
						ref: SignInModal
					},
					response
				})
			);
		}

		if (!$session) return;

		const { data, error } = await supabase
			.from("shared_notes")
			.upsert({
				...note,
				local_id: id,
				author_id: $session.user.id,
				createdAt: new Date(createdAt).toLocaleDateString()
			})
			.eq("local_id", id)
			.select()
			.single();

		if (!data) {
			console.error(error);
			return;
		}

		const { id: got_shared_id } = data;

		$currentNote.shared_id = got_shared_id;

		await goto(`/shared`);
		await goto(`/shared/${got_shared_id}`);
	}

	async function stopSharing() {
		if ($currentNote || !("author_id" in note)) return;

		if ($session?.user.id !== note.author_id) return;

		const res = await new Promise<boolean>((response, _) =>
			modalStore.trigger({
				title: "Stop sharing: " + note.title,
				body: "This will <strong>instantly</strong> stop sharing the note!",
				type: "confirm",
				response
			})
		);

		if (res) {
			await supabase.from("shared_notes").delete().eq("id", note.id);
			await goto("/local");
			await goto("/local/" + note.local_id);
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
		{#if folder === "local"}
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
		{/if}
		<button class="btn btn-sm variant-ghost" on:click={triggerCopyModalHelper}>
			<span>
				<LucideCopy class="w-4 h-4" />
			</span>
			<span>Make a copy</span>
		</button>
		{#if folder === "local"}
			<button class="btn btn-sm variant-ghost" on:click={deleteThis}>
				<span>
					<LucideTrash2 class="w-4 h-4" />
				</span>
				<span>Delete</span>
			</button>
			<button
				class="btn btn-sm variant-ghost"
				on:click={async () => {
					if ($currentNote?.shared_id) {
						await goto(`/shared`);
						await goto(`/shared/${$currentNote.shared_id}`);
						return;
					}

					modalStore.trigger({
						title: "Share note",
						body: "This will share the note with the world! (Publicly, for now)",
						type: "confirm",
						response: (r) => {
							if (r) shareNote();
						}
					});
				}}
			>
				<span>
					<LucideShare2 class="w-4 h-4" />
				</span>
				<span>{$currentNote?.shared_id ? "View Shared Page" : "Share"}</span>
			</button>
		{:else}
			<button
				class="btn btn-sm variant-ghost"
				use:clipboard={$page.url.toString()}
			>
				<span>
					<LucideCopy class="w-4 h-4" />
				</span>
				<span>Copy Share Link</span>
			</button>
			<button
				class="btn btn-sm variant-ghost"
				on:click={async () => {
					await goto(`/local`);
					await goto(`/local/${"local_id" in note ? note.local_id : ""}`);
				}}
			>
				<span>
					<LucideArrowUpRight class="w-4 h-4" />
				</span>
				<span>View Local Page</span>
			</button>
		{/if}
		{#if "author_id" in note && $session?.user.id === note.author_id && folder === "shared"}
			<button class="btn btn-sm variant-ghost" on:click={stopSharing}>
				<span>
					<LucideTrash2 class="w-4 h-4" />
				</span>
				<span>Stop sharing</span>
			</button>
		{/if}
	</div>
	<div class="overflow-y-auto">
		<div bind:this={element} />
	</div>
</div>
