import type { Command } from "commander";
import { chart } from "./chart";

export function registerChart(program: Command): void {
	program
		.command("chart")
		.description(
			"Chart a label/value series read from stdin, one pair per line (comma, tab or whitespace separated)",
		)
		.option("--title <title>", "Chart title")
		.action(chart);
}
