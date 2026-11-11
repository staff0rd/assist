import chalk from "chalk";
import { contextLevel } from "../shared/harnessAdapters/contextLevel";

export function colorizePercent(pct: number): string {
	const label = `${Math.round(pct)}%`;
	switch (contextLevel(pct)) {
		case "red":
			return chalk.red(label);
		case "yellow":
			return chalk.yellow(label);
		default:
			return label;
	}
}
