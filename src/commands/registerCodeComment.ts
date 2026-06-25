import type { Command } from "commander";
import { codeCommentConfirm } from "./codeComment/codeCommentConfirm";
import { codeCommentSet } from "./codeComment/codeCommentSet";

export function registerCodeComment(parent: Command): void {
	const codeComment = parent
		.command("code-comment")
		.description(
			"Escape hatch for the rare code comment that genuinely belongs",
		);

	codeComment
		.command("set")
		.description(
			"Validate a single-line comment and issue a pin to confirm its insertion",
		)
		.argument("<file>", "File the comment belongs in")
		.argument("<line>", "1-based line number to insert the comment at")
		.argument(
			"<text>",
			"Single-line comment text (max 50 chars, no block comments)",
		)
		.action(codeCommentSet);

	codeComment
		.command("confirm")
		.description("Confirm a pin to insert its comment and clear the pin state")
		.argument("<pin>", "Pin issued by 'code-comment set'")
		.action(codeCommentConfirm);
}
