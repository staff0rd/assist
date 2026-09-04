export type VttCue = {
	startMs: number;
	endMs: number;
	speaker: string | null;
	text: string;
};

export type VttPassage = {
	source: string;
	sourceStartMs: number;
	cues: VttCue[];
};

export type ChatMessage = {
	speaker: string;
	text: string;
};
