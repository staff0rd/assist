import type { Command } from "commander";
import { show } from "./show";

export function registerShow(program: Command): void {
	program
		.command("show")
		.description(
			"Open markdown in the session's web preview pane so long links, paths and snippets can be clicked and copied unbroken; prints it outside a web session",
		)
		.option("--title <title>", "Pane title")
		.requiredOption("--body <markdown|->", "Markdown to show, or - for stdin")
		.action(show);
}
