export type CreekSession = {
	id: string;
	createdAt: Date;
	title: string;
	blocks: CreekBlock[];
};

export type CreekBlock = {
	id: string;
	createdAt: Date;
	content: string;
};
