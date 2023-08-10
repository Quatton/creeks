export type CreekSession = {
	id: string;
	createdAt: Date;
	title: string;
	blocks: CreekBlock[];
};

export type CreekBlock = {
	createdAt: Date;
	content: string;
};
