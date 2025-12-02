import fs from "node:fs";
import chalk from "chalk";
import { minimatch } from "minimatch";
import { findSourceFiles } from "../../findSourceFiles";
import { getIgnoredFiles } from "./getIgnoredFiles.js";

const MAX_LINES = 100;

export function logViolations(
	violations: { file: string; lines: number }[],
): void {
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

	if (process.env.CLAUDECODE) {
		console.error(chalk.cyan(`\n  ## Extracting Code to New Files\n`));
		console.error(
			chalk.cyan(
				`  When extracting logic from one file to another, consider where the extracted code belongs:\n`,
			),
		);
		console.error(
			chalk.cyan(
				`  1. Keep related logic together: If the extracted code is tightly coupled to the\n     original file's domain, create a new folder containing both the original and extracted files.\n`,
			),
		);
		console.error(
			chalk.cyan(
				`  2. Share common utilities: If the extracted code can be reused across multiple\n     domains, move it to a common/shared folder.\n`,
			),
		);
	}
}

function countLines(filePath: string): number {
	const content = fs.readFileSync(filePath, "utf-8");
	return content.split("\n").length;
}

export function getViolations(
	pattern?: string,
): { file: string; lines: number }[] {
	let sourceFiles = findSourceFiles("src", { includeTests: false });
	const ignoredFiles = getIgnoredFiles();

	if (pattern) {
		sourceFiles = sourceFiles.filter((f: string) => minimatch(f, pattern));
	}

	const violations: { file: string; lines: number }[] = [];

	for (const filePath of sourceFiles) {
		const lineCount = countLines(filePath);
		if (lineCount > MAX_LINES && !ignoredFiles.has(filePath)) {
			violations.push({ file: filePath, lines: lineCount });
		}
	}

	return violations;
}
