export type VttCue = {
	startMs: number;
	endMs: number;
	speaker: string | null;
	text: string;
};

export type ChatMessage = {
	speaker: string;
	text: string;
};

export type VttFileInfo = {
	absolutePath: string;
	relativePath: string;
	filename: string;
};

export type MdFileInfo = {
	absolutePath: string;
	relativePath: string;
	filename: string;
};
