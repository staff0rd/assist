import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { denyConfigHelp } from "./deny/denyConfigHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerDeny(parent: Command): void {
	const denyCommand = parent
		.command("deny")
		.description("Manage command deny rules")
		.action(lazyAction(() => import("./deny/denyList"), "denyList"));

	configHelp(denyCommand, denyConfigHelp);

	denyCommand
		.command("add")
		.description("Add a deny rule for a command pattern")
		.argument("<pattern>", "Command prefix to deny")
		.argument("<message>", "Correction message shown to the agent")
		.option("--node", "Write to user (node): this node's ~/.assist.yml")
		.action(lazyAction(() => import("./deny/denyAdd"), "denyAdd"));

	denyCommand
		.command("remove")
		.description("Remove a deny rule by pattern")
		.argument("<pattern>", "Command prefix to remove")
		.option("--node", "Remove from user (node): this node's ~/.assist.yml")
		.action(lazyAction(() => import("./deny/denyRemove"), "denyRemove"));

	denyCommand
		.command("list")
		.description("List all deny rules")
		.action(lazyAction(() => import("./deny/denyList"), "denyList"));
}
