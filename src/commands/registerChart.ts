import type { Command } from "commander";
import { lazyAction } from "../shared/lazyAction";

export function registerChart(program: Command): void {
	program
		.command("chart")
		.description(
			"Chart a label/value series read from stdin, one pair per line (comma, tab or whitespace separated)",
		)
		.option("--title <title>", "Chart title")
		.action(lazyAction(() => import("./chart"), "chart"));
}
