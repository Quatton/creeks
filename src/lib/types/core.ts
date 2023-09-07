export type CreekSession = {
	id: string;
	createdAt: Date;
	title: string;
	// blocks: CreekBlock[];
	content: string;
	mode: "flow" | "edit";
	tidied: boolean;
};

export type CreekBlock = {
	createdAt: Date;
	content: string;
};
