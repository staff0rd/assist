import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { miroConfigHelp } from "./miroConfigHelp";
import { runExtract } from "./runExtract";
import type { MiroExtractOptions } from "./types";

export function registerMiro(program: Command): void {
	const miroCommand = program
		.command("miro")
		.description("Miro board utilities");

	const extract = miroCommand
		.command("extract")
		.description("Print the text of every box inside a rectangle on a board")
		.argument(
			"[name]",
			"Named extract from config supplying every field; any flag overrides its field",
		)
		.option("--items <file>", "File of raw board_list_items response pages")
		.option(
			"--top-left <id>",
			"Widget id or ?moveToWidget=<id> link of the top-left box (omit both anchors to pick them in the assist web UI)",
		)
		.option(
			"--bottom-right <id>",
			"Widget id or ?moveToWidget=<id> link of the bottom-right box",
		)
		.option("--ignore <file>", "YAML list of box texts to drop from the output")
		.option("--out <file>", "Write the YAML to this file instead of stdout")
		.option(
			"--board <id>",
			"Board id for the --out header (else read from the items)",
		)
		.option(
			"--frame <id>",
			"Frame id for the --out header (else read from the items)",
		)
		.option(
			"--save <name>",
			"Save the selection as this named extract without asking",
		)
		.option("-g, --global", "Save the extract to global ~/.assist.yml")
		.option(
			"-r, --repo [name]",
			"Requires -g: save the extract to a repo's shared db override instead (defaults to the current repo)",
		)
		.action((name: string | undefined, options: MiroExtractOptions) =>
			runExtract(name, options),
		);

	configHelp(
		extract,
		miroConfigHelp,
		"Paths in a saved extract are resolved from the repo root.",
	);
}
