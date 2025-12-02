import fs from "node:fs";
import { minimatch } from "minimatch";
import { findSourceFiles } from "../../findSourceFiles";
import { getIgnoredFiles } from "./getIgnoredFiles.js";

export const MAX_LINES = 100;

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
