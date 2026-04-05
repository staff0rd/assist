import type { Command } from "commander";
import { search as backlogSearch } from "./search";

export function registerSearchCommand(cmd: Command): void {
	cmd
		.command("search <query>")
		.description("Search backlog items by keyword")
		.action(backlogSearch);
}
