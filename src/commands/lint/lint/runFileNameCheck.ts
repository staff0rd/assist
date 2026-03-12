import path from "node:path";
import chalk from "chalk";
import { checkFileNames, type FileNameViolation } from "./checkFileNames";
import { fixFileNameViolations } from "./fixFileNameViolations";

function reportViolations(violations: FileNameViolation[]): void {
	console.error(chalk.red("\nFile name check failed:\n"));
	console.error(
		chalk.red(
			"  Files without classes or React components should not start with a capital letter.\n",
		),
	);
	for (const violation of violations) {
		console.error(chalk.red(`  ${violation.filePath}`));
		console.error(chalk.gray(`    Rename to: ${violation.suggestedName}\n`));
	}
	console.error(chalk.dim("  Run with -f to auto-fix.\n"));
}

export function runFileNameCheck(fix = false): boolean {
	const violations = checkFileNames();

	if (violations.length === 0) {
		if (!process.env.CLAUDECODE) {
			console.log(
				"File name check passed. All PascalCase files contain classes or components.",
			);
		}
		return true;
	}

	if (!fix) {
		reportViolations(violations);
		return false;
	}

	fixFileNameViolations(
		violations.map((v) => ({
			sourcePath: v.filePath,
			destPath: path.join(path.dirname(v.filePath), v.suggestedName),
		})),
	);

	return true;
}
