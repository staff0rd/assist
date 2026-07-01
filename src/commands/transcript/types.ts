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
