import type { ConfigHelpEntry } from "../../shared/configHelp";

export const transcriptConfigHelp: ConfigHelpEntry[] = [
	{
		key: "transcript.vttDir",
		setter: "assist transcript configure",
		note: "pick-up directory scanned for raw .vtt files",
	},
	{
		key: "transcript.transcriptsDir",
		setter: "assist transcript configure",
		note: "directory dated markdown transcripts are written to",
	},
	{
		key: "transcript.summaryDir",
		setter: "assist transcript configure",
		note: "directory generated transcript summaries are written to",
	},
];
