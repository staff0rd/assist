import type { Command } from "commander";
import { lazyAction } from "../../../shared/lazyAction";

const SESSION_ID =
	"Session id from assist sessions list (<node>:<id> for a linked node)";

function collect(value: string, previous: string[]): string[] {
	return [...previous, value];
}

export function registerPreviewCommands(cmd: Command): void {
	cmd
		.command("previews")
		.argument("<session-id>", SESSION_ID)
		.description(
			"Show a session's pending preview: kind, title, body and a question form's options",
		)
		.option("--json", "Print the pending preview as JSON (null when none)")
		.action(lazyAction(() => import("./sessionPreviews"), "sessionPreviews"));

	cmd
		.command("decide")
		.argument("<session-id>", SESSION_ID)
		.description(
			"Answer a session's pending preview, unblocking the command waiting on it",
		)
		.option(
			"--approve [note]",
			"Approve (a manual check: works), optionally with a note",
		)
		.option(
			"--reject [note]",
			"Reject with a reason (a manual check: doesn't work; a question form: decline)",
		)
		.option(
			"--answer <choice>",
			"Answer a question form: <number|header>=<option label or own text>, or just <choice> for a single question; repeat per question or multi-select choice",
			collect,
			[],
		)
		.action(lazyAction(() => import("./decideSession"), "decideSession"));
}
