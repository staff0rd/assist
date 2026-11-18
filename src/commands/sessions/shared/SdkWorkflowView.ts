import type { SdkShellChunk } from "./SdkShellRow";

export type SdkWorkflowView = {
	command: string;
	startedAt: number;
	lines: SdkShellChunk[];
};
