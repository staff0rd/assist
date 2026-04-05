import type { Command } from "commander";
import { del as backlogDel } from "./delete";
import { done as backlogDone } from "./done";
import { start as backlogStart } from "./start";
import { wontdo as backlogWontdo } from "./wontdo";

export function registerStatusCommands(cmd: Command): void {
	cmd
		.command("start <id>")
		.description("Set a backlog item to in-progress")
		.action(backlogStart);

	cmd
		.command("done <id> [summary]")
		.description("Set a backlog item to done")
		.action(backlogDone);

	cmd
		.command("wontdo <id> [reason]")
		.description("Set a backlog item to won't do")
		.action(backlogWontdo);

	cmd
		.command("delete <id>")
		.alias("remove")
		.description("Delete a backlog item")
		.action(backlogDel);
}
