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

	if (process.env.CLAUDECODE) {
		for (const violation of violations) {
			console.log(violation.file);
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
}

function countLines(filePath: string): number {
	const content = fs.readFileSync(filePath, "utf-8");
	return content.split("\n").length;
}

export function getViolations(
	pattern?: string,
): { file: string; lines: number }[] {
	let sourceFiles = findSourceFiles("src");
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
