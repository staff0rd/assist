export type DevEntry = {
	title: string | null;
	firstVersion: string | null;
	lastVersion: string | null;
};

export type Commit = {
	date: string;
	hash: string;
	message: string;
	files: string[];
};
