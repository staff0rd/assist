import { execSync } from "node:child_process";
import fs from "node:fs";
import chalk from "chalk";
import { minimatch } from "minimatch";
import { findSourceFiles } from "../../findSourceFiles";
import { getIgnoredFiles } from "./getIgnoredFiles.js";

export type GitFilterOptions = {
	modified?: boolean;
	staged?: boolean;
	unstaged?: boolean;
};

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
	console.error(chalk.gray(`    assist refactor ignore <file>\n`));

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

function getGitFiles(options: GitFilterOptions): Set<string> | null {
	if (!options.modified && !options.staged && !options.unstaged) {
		return null;
	}

	const files = new Set<string>();

	if (options.staged || options.modified) {
		const staged = execSync("git diff --cached --name-only", {
			encoding: "utf-8",
		});
		for (const file of staged.trim().split("\n").filter(Boolean)) {
			files.add(file);
		}
	}

	if (options.unstaged || options.modified) {
		const unstaged = execSync("git diff --name-only", { encoding: "utf-8" });
		for (const file of unstaged.trim().split("\n").filter(Boolean)) {
			files.add(file);
		}
	}

	return files;
}

export function getViolations(
	pattern?: string,
	options: GitFilterOptions = {},
): { file: string; lines: number }[] {
	let sourceFiles = findSourceFiles("src", { includeTests: false });
	const ignoredFiles = getIgnoredFiles();
	const gitFiles = getGitFiles(options);

	if (pattern) {
		sourceFiles = sourceFiles.filter((f: string) => minimatch(f, pattern));
	}

	if (gitFiles) {
		sourceFiles = sourceFiles.filter((f: string) => gitFiles.has(f));
	}

	const violations: { file: string; lines: number }[] = [];

	for (const filePath of sourceFiles) {
		const lineCount = countLines(filePath);
		const maxAllowed = ignoredFiles.get(filePath) ?? MAX_LINES;
		if (lineCount > maxAllowed) {
			violations.push({ file: filePath, lines: lineCount });
		}
	}

	return violations;
}
