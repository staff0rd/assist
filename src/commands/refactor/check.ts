import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { getIgnoredFiles } from "./getIgnoredFiles.js";

const EXTENSIONS = [".ts", ".tsx"];
const MAX_LINES = 100;

function findAllSourceFiles(dir: string): string[] {
	const results: string[] = [];

	if (!fs.existsSync(dir)) {
		return results;
	}

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory() && entry.name !== "node_modules") {
			results.push(...findAllSourceFiles(fullPath));
		} else if (
			entry.isFile() &&
			EXTENSIONS.some((ext) => entry.name.endsWith(ext))
		) {
			results.push(fullPath);
		}
	}

	return results;
}

function countLines(filePath: string): number {
	const content = fs.readFileSync(filePath, "utf-8");
	return content.split("\n").length;
}

export function check(): void {
	const sourceFiles = findAllSourceFiles("src");
	const ignoredFiles = getIgnoredFiles();

	const violations: { file: string; lines: number }[] = [];

	for (const filePath of sourceFiles) {
		const lineCount = countLines(filePath);
		if (lineCount > MAX_LINES && !ignoredFiles.has(filePath)) {
			violations.push({ file: filePath, lines: lineCount });
		}
	}

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
