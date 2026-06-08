import chalk from "chalk";
import { cyclomatic } from "./cyclomatic";
import { findSourceFiles } from "./findSourceFiles";
import { halstead } from "./halstead";
import { maintainability } from "./maintainability";
import { sloc } from "./sloc";

export async function analyze(pattern: string): Promise<void> {
	const searchPattern =
		pattern.includes("*") || pattern.includes("/") ? pattern : `**/${pattern}`;

	const files = findSourceFiles(searchPattern);

	if (files.length === 0) {
		console.log(chalk.yellow("No files found matching pattern"));
		return;
	}

	if (files.length === 1) {
		const file = files[0];
		console.log(chalk.bold.underline("SLOC"));
		await sloc(file);
		console.log();
		console.log(chalk.bold.underline("Cyclomatic Complexity"));
		await cyclomatic(file);
		console.log();
		console.log(chalk.bold.underline("Halstead Metrics"));
		await halstead(file);
		console.log();
		console.log(chalk.bold.underline("Maintainability Index"));
		await maintainability(file);
		return;
	}

	await maintainability(searchPattern);
}
