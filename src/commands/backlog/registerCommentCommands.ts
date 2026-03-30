import type { Command } from "commander";
import { comment } from "./comment";
import { comments } from "./comments";

export function registerCommentCommands(cmd: Command): void {
	cmd
		.command("comment <id> <text>")
		.description("Add a comment to a backlog item")
		.action(comment);

	cmd
		.command("comments <id>")
		.description("List comments and summaries for a backlog item")
		.action(comments);
}
