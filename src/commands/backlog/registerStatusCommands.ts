import type { Command } from "commander";
import { del as backlogDel } from "./delete";
import { done as backlogDone } from "./done";
import { star as backlogStar } from "./star";
import { start as backlogStart } from "./start";
import { stop as backlogStop } from "./stop";
import { unstar as backlogUnstar } from "./unstar";
import { wontdo as backlogWontdo } from "./wontdo";

export function registerStatusCommands(cmd: Command): void {
	cmd
		.command("start <id>")
		.description("Set a backlog item to in-progress")
		.action(backlogStart);

	cmd
		.command("stop")
		.description("Revert all in-progress backlog items to todo")
		.action(backlogStop);

	cmd
		.command("done <id> [summary]")
		.description("Set a backlog item to done")
		.action(backlogDone);

	cmd
		.command("wontdo <id> [reason]")
		.description("Set a backlog item to won't do")
		.action(backlogWontdo);

	cmd
		.command("star <id>")
		.description("Star a backlog item to pin it in the web view")
		.action(backlogStar);

	cmd
		.command("unstar <id>")
		.description("Remove the star from a backlog item")
		.action(backlogUnstar);

	cmd
		.command("delete <id>")
		.alias("remove")
		.description("Delete a backlog item")
		.action(backlogDel);
}
