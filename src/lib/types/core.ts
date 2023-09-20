import type { Database } from "./supabase";

export type CreekSession = {
	id: string;
	createdAt: Date;
	title: string;
	// blocks: CreekBlock[];
	content: string;
	mode: "flow" | "edit";
	tidied: boolean;
	time: number;
};

export type CreekNote = {
	id: string;
	createdAt: Date;
	title: string;
	content: string;
	shared_id?: string;
	mermaid: string;
	mermaidConfig?: {
		pan: ReturnType<ReturnType<typeof svgPanZoom>["getPan"]>;
		zoom: ReturnType<ReturnType<typeof svgPanZoom>["getZoom"]>;
	};
};

export type SharedNote = Database["public"]["Tables"]["shared_notes"]["Row"];

export type CreekBlock = {
	createdAt: Date;
	content: string;
};
