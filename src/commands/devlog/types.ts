export type DevlogEntry = {
	version: string;
	title: string;
	filename: string;
};

export type AssistConfig = {
	devlog?: {
		diff?: {
			ignore?: string[];
		};
	};
};

export type Commit = {
	date: string;
	hash: string;
	message: string;
	files: string[];
};
