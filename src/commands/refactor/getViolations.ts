import { execSync } from "node:child_process";
import fs from "node:fs";
import { minimatch } from "minimatch";
import { findSourceFiles } from "../../shared/findSourceFiles";
import { getIgnoredFiles } from "./getIgnoredFiles.js";
import { DEFAULT_MAX_LINES } from "./logViolations.js";

export type GitFilterOptions = {
	modified?: boolean;
	staged?: boolean;
	unstaged?: boolean;
};

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
	maxLines: number = DEFAULT_MAX_LINES,
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
		const maxAllowed = ignoredFiles.get(filePath) ?? maxLines;
		if (lineCount > maxAllowed) {
			violations.push({ file: filePath, lines: lineCount });
		}
	}

	return violations;
}
