export type SdkShellChunk = { stream: "stdout" | "stderr"; text: string };

export type SdkShellRow = {
	id: string;
	command: string;
	output: SdkShellChunk[];
	state: "running" | "held";
	startedAt: number;
	exitCode?: number;
	durationMs?: number;
};
