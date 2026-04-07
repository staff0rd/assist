import type { Command } from "commander";
import { activity } from "./activity";

export function registerActivity(program: Command): void {
	program
		.command("activity")
		.description("Chart GitHub commit activity per day")
		.option(
			"--since <date>",
			"Start date (YYYY-MM-DD), defaults to 30 days ago",
		)
		.action(activity);
}
