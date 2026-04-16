import type { Command } from "commander";
import { denyAdd } from "./deny/denyAdd";
import { denyList } from "./deny/denyList";
import { denyRemove } from "./deny/denyRemove";

export function registerDeny(parent: Command): void {
	const denyCommand = parent
		.command("deny")
		.description("Manage command deny rules")
		.action(denyList);

	denyCommand
		.command("add")
		.description("Add a deny rule for a command pattern")
		.argument("<pattern>", "Command prefix to deny")
		.argument("<message>", "Correction message shown to the agent")
		.option("-g, --global", "Write to global ~/.assist.yml")
		.action(denyAdd);

	denyCommand
		.command("remove")
		.description("Remove a deny rule by pattern")
		.argument("<pattern>", "Command prefix to remove")
		.option("-g, --global", "Remove from global ~/.assist.yml")
		.action(denyRemove);

	denyCommand
		.command("list")
		.description("List all deny rules")
		.action(denyList);
}
