import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerSearchCommand(cmd: Command): void {
	cmd
		.command("search <query>")
		.description("Search backlog items by keyword")
		.action(lazyAction(() => import("./search"), "search"));
}
