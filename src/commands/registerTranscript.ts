import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import {
	clean as transcriptClean,
	configure as transcriptConfigure,
	list as transcriptList,
	merge as transcriptMerge,
	move as transcriptMove,
} from "./transcript";
import { transcriptConfigHelp } from "./transcript/transcriptConfigHelp";

export function registerTranscript(program: Command): void {
	const transcriptCommand = program
		.command("transcript")
		.description("Meeting transcript utilities");

	configHelp(transcriptCommand, transcriptConfigHelp);

	transcriptCommand
		.command("configure")
		.description("Configure transcript directories")
		.action(transcriptConfigure);

	transcriptCommand
		.command("list")
		.description("List raw .vtt filenames waiting in the pick-up directory")
		.action(transcriptList);

	transcriptCommand
		.command("clean <path>")
		.description("Clean any .vtt file and write the result to stdout")
		.option("--format <md|vtt>", "output format", "md")
		.action(transcriptClean);

	transcriptCommand
		.command("merge <path...>")
		.description(
			"Collapse several .vtt files into one transcript with NOTE provenance",
		)
		.option("--out <path>", "write the merged transcript to this path")
		.action(transcriptMerge);

	transcriptCommand
		.command("move <file>")
		.description(
			"Convert a raw .vtt to a dated markdown transcript and archive the original",
		)
		.requiredOption("--date <YYYY-MM-DD>", "meeting date")
		.requiredOption("--client <name>", "client name")
		.action(transcriptMove);
}
