import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { lazyAction } from "../../shared/lazyAction";

export function registerStatusCommands(cmd: Command): void {
	cmd
		.command("start <id>")
		.description("Set a backlog item to in-progress")
		.action(lazyAction(() => import("./start"), "start"));

	cmd
		.command("stop")
		.description("Revert all in-progress backlog items to todo")
		.action(lazyAction(() => import("./stop"), "stop"));

	internalCommand(
		cmd
			.command("done <id> [summary]")
			.description("Set a backlog item to done")
			.action(lazyAction(() => import("./done"), "done")),
		"the review phase of a backlog run",
	);

	cmd
		.command("wontdo <id> [reason]")
		.description("Set a backlog item to won't do")
		.action(lazyAction(() => import("./wontdo"), "wontdo"));

	cmd
		.command("set-status <id> <status>")
		.description(
			"Set a backlog item to a specific status (todo, in-progress, done, wontdo)",
		)
		.action(lazyAction(() => import("./setStatusCommand"), "setStatusCommand"));

	cmd
		.command("star <id>")
		.description("Star a backlog item to pin it in the web view")
		.action(lazyAction(() => import("./star"), "star"));

	cmd
		.command("unstar <id>")
		.description("Remove the star from a backlog item")
		.action(lazyAction(() => import("./unstar"), "unstar"));

	cmd
		.command("delete <id>")
		.alias("remove")
		.description("Delete a backlog item")
		.action(lazyAction(() => import("./del"), "del"));
}
