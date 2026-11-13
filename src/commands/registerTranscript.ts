import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { registerMergeCommand } from "./transcript/registerMergeCommand";
import { transcriptConfigHelp } from "./transcript/transcriptConfigHelp";
import { transcriptWorkflowHelp } from "./transcript/transcriptWorkflowHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerTranscript(program: Command): void {
	const transcriptCommand = program
		.command("transcript")
		.description("Meeting transcript utilities")
		.addHelpText("after", () => transcriptWorkflowHelp());

	configHelp(transcriptCommand, transcriptConfigHelp);

	transcriptCommand
		.command("configure")
		.description("Configure transcript directories")
		.action(lazyAction(() => import("./transcript/configure"), "configure"));

	internalCommand(
		transcriptCommand
			.command("list")
			.description("List raw .vtt filenames waiting in the pick-up directory")
			.action(lazyAction(() => import("./transcript/list"), "list")),
		"/transcripts",
	);

	transcriptCommand
		.command("clean <path>")
		.description("Clean any .vtt file and write the result to stdout")
		.option("--format <md|vtt>", "output format", "md")
		.option(
			"--timestamps",
			"prefix each speaker turn with its start time (--format md only)",
		)
		.action(lazyAction(() => import("./transcript/clean"), "clean"));

	registerMergeCommand(transcriptCommand);

	internalCommand(
		transcriptCommand
			.command("move <file>")
			.description(
				"Convert a raw .vtt to a dated markdown transcript and archive the original",
			)
			.requiredOption("--date <YYYY-MM-DD>", "meeting date")
			.requiredOption("--client <name>", "client name")
			.action(lazyAction(() => import("./transcript/move"), "move")),
		"/transcripts",
	);
}
