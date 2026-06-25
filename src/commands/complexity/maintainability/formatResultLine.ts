import chalk from "chalk";
import type { ResultEntry } from "./ResultEntry";

export function formatResultLine(entry: ResultEntry, failing: boolean): string {
	const { file, avgMaintainability, minMaintainability, override } = entry;
	const name = failing ? chalk.red(file) : chalk.white(file);
	const suffix =
		override !== undefined ? chalk.magenta(` (override: ${override})`) : "";
	return `${name} → avg: ${chalk.cyan(avgMaintainability.toFixed(1))}, min: ${chalk.yellow(minMaintainability.toFixed(1))}${suffix}`;
}
