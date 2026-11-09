import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { askDesign } from "./askDesign";

export function registerAskDesign(program: Command): void {
	internalCommand(
		program
			.command("ask-design")
			.description(
				"Open a claude.ai design artifact in the session's web preview pane for the user to approve or reject, with inline comments, and wait for the decision; prints the link outside a web session, and exits with the reasons when design review is unavailable on the running harness (it needs artifact publishing)",
			)
			.requiredOption(
				"--url <artifact-url>",
				"claude.ai artifact link of the design",
			)
			.requiredOption("--title <title>", "Pane title")
			.option("--body <markdown|->", "Markdown summary, or - for stdin")
			.action(askDesign),
		"/draft",
	);
}
