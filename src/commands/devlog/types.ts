export type DevlogEntry = {
	version: string;
	title: string;
	filename: string;
};

export type AssistConfig = {
	devlog?: {
		ignore?: string[];
		skip?: {
			days?: string[];
		};
	};
};

export type Commit = {
	date: string;
	hash: string;
	message: string;
	files: string[];
};
