import type { Command } from "commander";
import { ask } from "./ask";

export function registerAsk(program: Command): void {
	program
		.command("ask")
		.description(
			"Open markdown in the session's web preview pane for the user to approve or reject, with inline comments, and wait for the decision; prints it outside a web session",
		)
		.requiredOption("--title <title>", "Pane title")
		.requiredOption("--body <markdown|->", "Markdown to review, or - for stdin")
		.action(ask);
}
