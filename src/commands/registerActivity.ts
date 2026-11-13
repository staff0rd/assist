import type { Command } from "commander";
import { lazyAction } from "../shared/lazyAction";

export function registerActivity(program: Command): void {
	program
		.command("activity")
		.description("Chart GitHub commit activity per day")
		.option(
			"--since <date>",
			"Start date (YYYY-MM-DD), defaults to 30 days ago",
		)
		.action(lazyAction(() => import("./activity"), "activity"));
}
