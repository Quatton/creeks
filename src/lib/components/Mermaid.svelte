<script lang="ts">
	import { getNoteStore, sessions } from "$lib/stores/core";
	import type { CreekNote, SharedNote } from "$lib/types/core";
	import { mermaidParse, mermaidRender } from "$lib/utils/mermaid";
	import {
		modeCurrent,
		type ModalSettings,
		type PopupSettings,
		type ModalComponent,
		getModalStore
	} from "@skeletonlabs/skeleton";
	import { useCompletion } from "ai/svelte";
	import { onMount } from "svelte";
	import panzoom from "svg-pan-zoom";
	import MermaidModal from "./MermaidModal.svelte";
	import { get, type Unsubscriber } from "svelte/store";

	export let note: CreekNote | SharedNote;
	export let session: Session | null;

	import LucideAxis3d from "~icons/lucide/axis-3d";
	import LucideLoader2 from "~icons/lucide/loader-2";
	import LucideWrench from "~icons/lucide/wrench";
	import LucideClipboardPaste from "~icons/lucide/clipboard-paste";
	import LucideClipboardCopy from "~icons/lucide/copy";

	import { clipboard } from "@skeletonlabs/skeleton";
	import LucideFiles from "~icons/lucide/files";
	import type { Session } from "@supabase/supabase-js";

	export let folder: "local" | "shared" = "local";
	const currentNote = folder === "local" ? getNoteStore(note.id) : null;

	let unsub: Unsubscriber = () => {};
	const { completion: completionM, complete: completeM } = useCompletion({
		api: "/api/mermaid",
		onFinish: (_, completion) => {
			setTimeout(() => {
				pzoom?.resize();
				pzoom?.reset();
			});
		}
	});

	const { complete, completion, stop } = useCompletion({
		api: "/api/branch",
		onFinish: (_, completion) => {
			setTimeout(() => {
				pzoom?.resize();
				pzoom?.reset();
			});
			prevBranch = completion;
		}
	});

	const { complete: completeF, completion: completionF } = useCompletion({
		api: "/api/fix",
		onFinish: (_, completion) => {
			setTimeout(() => {
				pzoom?.resize();
				pzoom?.reset();
			});
		}
	});

	const { complete: completeQ, completion: completionQ } = useCompletion({
		api: "/api/ask",
		onFinish: (_, completion) => {
			setTimeout(() => {
				pzoom?.resize();
				pzoom?.reset();
			});
			prevQ = completion;
		}
	});

	let prevQ = "";
	let prevBranch = "";

	function injectBranch(snapshot: string, completion: string, r: string) {
		if (!$currentNote) return;

		const result = completion.replace(/`/g, "");

		// if it hasn't end yet, put premature `end` to the end
		$currentNote.mermaid = `${snapshot}
	${result}${result.trim().endsWith("end") ? "" : "\n\tend"}`;
	}

	function injectQuestion(snapshot: string, completion: string, r: string) {
		if (!$currentNote) return;
		const result = completion.replace(/`/g, "");

		$currentNote.mermaid = `${snapshot}
	${result}`;
	}

	let mermaid: HTMLDivElement;
	let pzoom: typeof panzoom | undefined;

	let nodes: NodeListOf<SVGElement> | undefined;
	let edges: NodeListOf<SVGElement>;

	let shouldFix = false;

	let ultraSpecificCounterThatWillHelpMeDetermineIfIshouldResizeThePzoom = true;

	$: {
		if (
			ultraSpecificCounterThatWillHelpMeDetermineIfIshouldResizeThePzoom &&
			pzoom
		) {
			pzoom.resize();
			pzoom.reset();
			ultraSpecificCounterThatWillHelpMeDetermineIfIshouldResizeThePzoom =
				false;
		}
	}

	onMount(() => {
		code = $currentNote?.mermaid ?? note.mermaid;
		if ($currentNote?.mermaid === "") {
			genFlowchart();
		} else {
			if ($currentNote)
				mermaidParse($currentNote.mermaid).then((t) => {
					shouldFix = !t;
				});
		}
		return () => {
			nodes?.forEach((node) => {
				node.removeEventListener("click", clickNode(node));
			});
		};
	});

	async function fixFlowchart() {
		if (!$currentNote) return;

		const unsub = completionF.subscribe((completion) => {
			const result = completion.replace(/`/g, "");
			if (!$currentNote) return;
			$currentNote.mermaid = result;
		});

		await completeF(`[ORIGINAL MARKDOWN CONTENT]
# ${$currentNote.title}
${$currentNote.content}

[ORIGINAL MERMAID FLOWCHART (might contain multiples)]
${$currentNote.mermaid}`).then(() => {
			unsub();
		});
	}

	async function genFlowchart() {
		if (!$currentNote) return;

		shouldFix = false;
		unsub = completionM.subscribe((completion) => {
			const result = completion.replace(/`/g, "");
			if (!$currentNote) return;
			$currentNote.mermaid = result;
		});

		await completeM(`TITLE: ${$currentNote.title}
			CONTENT: ${$currentNote.content}
			`).then(() => {
			unsub();
		});
	}

	let id: NodeJS.Timeout | undefined;

	let code: string;
	$: {
		if ($currentNote) code = $currentNote.mermaid;
	}
	$: {
		// id && clearTimeout(id);
		// id = setTimeout(() => {
		// 	shouldFix = true;
		// }, 5000);
		mermaidParse(code).then(async (t) => {
			if (t) {
				const { svg } = await mermaidRender(
					{
						darkMode: !$modeCurrent
					},
					code,
					"graph-div"
				);
				setupPanzoom();
				mermaid.innerHTML = svg;
				const graphDiv = document.querySelector("svg#graph-div");
				graphDiv?.attributes.removeNamedItem("style");
				bindClicks();
				// clearTimeout(id);
				// shouldFix = false;
			}
		});
	}

	const setupPanzoom = () => {
		pzoom?.destroy();
		pzoom = undefined;

		void Promise.resolve().then(() => {
			const { pan, zoom } = ($currentNote
				? $currentNote.mermaidConfig
				: null) ?? {
				pan: undefined,
				zoom: undefined
			};
			pzoom = panzoom("#graph-div", {
				fit: true,
				center: true,
				beforePan: handlePanZoomChange,
				beforeZoom: handlePanZoomChange,
				controlIconsEnabled: true,
				zoomScaleSensitivity: 0.2,
				minZoom: 0.1,
				maxZoom: Infinity
			});
			if (!!pan && !!zoom && Number.isFinite(zoom)) {
				pzoom.zoom(zoom);
				pzoom.pan(pan);
			}
		});
	};

	const handlePanZoomChange = () => {
		if (!pzoom) {
			return;
		}
		const pan = pzoom.getPan();
		const zoom = pzoom.getZoom();

		if ($currentNote)
			$currentNote.mermaidConfig = {
				pan,
				zoom
			};
	};

	function bindClicks() {
		if (!$currentNote) return;

		nodes = document.querySelectorAll("g.node");
		nodes.forEach((node) => {
			node.classList.add("cursor-pointer");
			node.addEventListener("click", clickNode(node));
		});
	}

	const clickNode = (node: SVGElement) => () => {
		const elementId = node.id;
		// flowchart-[id]-###
		// can be buggy if id contains -
		const id = elementId.split("-").slice(1, -1).join("-");
		const label = node.querySelector("span.nodeLabel")?.innerHTML ?? "";

		modalStore.trigger(modalFn({ id, label }));
	};

	const modalStore = getModalStore();

	const modalComponent: (node: {
		id: string;
		label: string;
	}) => ModalComponent = (node) => {
		return {
			ref: MermaidModal,
			props: {
				node,
				noteId: $currentNote!.id // if error here, it's because currentNote is null
			}
		};
	};

	const modalFn: (node: { id: string; label: string }) => ModalSettings = (
		node
	) => ({
		type: "component",
		component: modalComponent(node),
		response(r) {
			if (!r) return;
			if (!currentNote) return;
			if (r.action === "branch") {
				const snapshot = get(currentNote).mermaid;
				const unsub = completion.subscribe((completion) => {
					if (completion === prevBranch) return;
					injectBranch(snapshot, completion, r.meta);
				});
				complete(r.prompt);
			}
			if (r.action === "ask") {
				const snapshot = get(currentNote).mermaid;
				const unsub = completionQ.subscribe((completion) => {
					if (completion === prevQ) return;
					injectQuestion(snapshot, completion, r.meta);
				});
				completeQ(r.prompt);
			}
		}
	});

	let switchAxisForOthers: "TD" | "LR" = "TD";
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.altKey && event.key === "r") {
			genFlowchart();
		}
	}}
	on:resize={() => {
		if (pzoom) {
			pzoom.resize();
		}
	}}
/>

<div class="relative grow flex flex-col">
	<div
		bind:this={mermaid}
		class="grow [&_>_#graph-div]:w-full [&_>_#graph-div]:h-full overflow-auto"
	/>

	<div class="flex gap-2 items-center">
		<button
			class="btn-icon"
			on:click={() => {
				// graph the first line of mermaid
				if ($currentNote) {
					const firstLine = $currentNote.mermaid.split("\n")[0];

					// change TD to LR and vice versa
					const newLine = firstLine.includes("TD")
						? firstLine.replace("TD", "LR")
						: firstLine.replace("LR", "TD");

					$currentNote.mermaid =
						newLine +
						"\n" +
						$currentNote.mermaid.split("\n").slice(1).join("\n");
				} else {
					switchAxisForOthers = switchAxisForOthers === "TD" ? "LR" : "TD";
					code = `graph ${switchAxisForOthers}
${code.split("\n").slice(1).join("\n")}`;
				}

				setTimeout(() => {
					pzoom?.resize();
					pzoom?.reset();
				}, 0);
			}}
		>
			<LucideAxis3d class="w-6 h-6" />
		</button>

		<button class="btn-icon" use:clipboard={$currentNote?.mermaid ?? ""}>
			<LucideClipboardCopy class="w-6 h-6" />
		</button>

		<!-- <button
			class="btn-icon"
			on:click={async () => {
				const c = new Clipboard();
				$currentNote.mermaid = await c.readText();
			}}
		>
			<LucideClipboardPaste class="w-6 h-6" />
		</button> -->

		<!-- <button
			class="btn-icon"
			on:click={() => {
				fixFlowchart();
				shouldFix = false;
			}}
		>
			<LucideWrench class="w-6 h-6" />
		</button>

		{#if shouldFix}
			<span class="text-sm">
				This flowchart is broken. Please click the wrench icon to fix it.
			</span>
		{/if} -->

		<!-- 
		{#if isLoadingM}
			<LucideLoader2 class="w-6 h-6 animate-spin" />
			<span>Generating...</span>
		{/if} -->
	</div>
</div>
