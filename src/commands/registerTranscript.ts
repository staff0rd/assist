import type { Command } from "commander";
import {
	configure as transcriptConfigure,
	format as transcriptFormat,
	summarise as transcriptSummarise,
} from "./transcript";

export function registerTranscript(program: Command): void {
	const transcriptCommand = program
		.command("transcript")
		.description("Meeting transcript utilities");

	transcriptCommand
		.command("configure")
		.description("Configure transcript directories")
		.action(transcriptConfigure);

	transcriptCommand
		.command("format")
		.description("Convert VTT files to formatted markdown transcripts")
		.action(transcriptFormat);

	transcriptCommand
		.command("summarise")
		.description("List transcripts that do not have summaries")
		.action(transcriptSummarise);
}
