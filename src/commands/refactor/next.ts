import chalk from "chalk";
import { getViolations, MAX_LINES } from "./getViolations.js";

export function next(): void {
	const violations = getViolations();

	if (violations.length === 0) {
		console.log(
			chalk.green(`No files exceed ${MAX_LINES} lines. Nothing to refactor.`),
		);
		return;
	}

	violations.sort((a, b) => b.lines - a.lines);

	const nextFile = violations[0];
	console.log(nextFile.file);
}
