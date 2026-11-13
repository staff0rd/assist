import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { lazyAction } from "../../shared/lazyAction";

export function registerCommentCommands(cmd: Command): void {
	internalCommand(
		cmd
			.command("comment <id> <text>")
			.description("Add a comment to a backlog item")
			.action(lazyAction(() => import("./comment"), "comment")),
		"backlog run phases and /refine",
	);

	cmd
		.command("comments <id>")
		.description("List comments and summaries for a backlog item")
		.action(lazyAction(() => import("./comments"), "comments"));

	cmd
		.command("delete-comment <id> <comment-id>")
		.description("Delete a comment from a backlog item")
		.action(lazyAction(() => import("./deleteCommentCmd"), "deleteCommentCmd"));
}
