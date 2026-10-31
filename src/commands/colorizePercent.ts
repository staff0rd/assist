import chalk from "chalk";
import { contextLevel } from "../shared/contextLevel";

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
