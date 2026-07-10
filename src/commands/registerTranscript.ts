import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import {
	configure as transcriptConfigure,
	list as transcriptList,
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
		.command("move <file>")
		.description(
			"Convert a raw .vtt to a dated markdown transcript and archive the original",
		)
		.requiredOption("--date <YYYY-MM-DD>", "meeting date")
		.requiredOption("--client <name>", "client name")
		.action(transcriptMove);
}
