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
	tidied: boolean;
	mermaid: string;
};

export type CreekBlock = {
	createdAt: Date;
	content: string;
};
