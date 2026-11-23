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
		.command("delivered <id> <text>")
		.description(
			"Record an item's one-line Delivered statement: what now works (recorded by its Review phase)",
		)
		.action(lazyAction(() => import("./delivered"), "delivered"));

	cmd
		.command("result <id> <text>")
		.description(
			"Record an item's one-line result: its predicted effect against the measured one",
		)
		.action(lazyAction(() => import("./result"), "result"));

	cmd
		.command("comments <id>")
		.description("List comments and summaries for a backlog item")
		.action(lazyAction(() => import("./comments"), "comments"));

	cmd
		.command("delete-comment <id> <comment-id>")
		.description("Delete a comment from a backlog item")
		.action(lazyAction(() => import("./deleteCommentCmd"), "deleteCommentCmd"));
}
