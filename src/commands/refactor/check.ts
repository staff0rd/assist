import chalk from "chalk";
import { getViolations, MAX_LINES } from "./getViolations.js";

export function check(pattern?: string): void {
	const violations = getViolations(pattern);

	if (violations.length === 0) {
		if (!process.env.CLAUDECODE) {
			console.log(`Refactor check passed. No files exceed ${MAX_LINES} lines.`);
		}
		return;
	}

	console.error(chalk.red(`\nRefactor check failed:\n`));
	console.error(
		chalk.red(`  The following files exceed ${MAX_LINES} lines:\n`),
	);

	for (const violation of violations) {
		console.error(chalk.red(`  ${violation.file} (${violation.lines} lines)`));
	}

	console.error(
		chalk.yellow(
			`\n  Each file needs to be sensibly refactored, or if there is no sensible\n  way to refactor it, ignore it with:\n`,
		),
	);
	console.error(
		chalk.gray(`    assist refactor ignore <file> --reason "<reason>"\n`),
	);

	process.exit(1);
}
