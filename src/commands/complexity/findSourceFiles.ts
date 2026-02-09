import fs from "node:fs";
import path from "node:path";
import { minimatch } from "minimatch";
import { loadConfig } from "../../shared/loadConfig";

function applyIgnoreGlobs(files: string[]): string[] {
	const { complexity } = loadConfig();
	return files.filter(
		(f) => !complexity.ignore.some((glob) => minimatch(f, glob)),
	);
}

function walk(dir: string, results: string[]): void {
	if (!fs.existsSync(dir)) {
		return;
	}
	const extensions = [".ts", ".tsx"];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name !== "node_modules" && entry.name !== ".git") {
				walk(fullPath, results);
			}
		} else if (
			entry.isFile() &&
			extensions.some((ext) => entry.name.endsWith(ext))
		) {
			results.push(fullPath);
		}
	}
}

export function findSourceFiles(pattern: string, baseDir = "."): string[] {
	const results: string[] = [];

	if (pattern.includes("*")) {
		walk(baseDir, results);
		return applyIgnoreGlobs(results.filter((f) => minimatch(f, pattern)));
	}

	if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
		return [pattern];
	}

	if (fs.existsSync(pattern) && fs.statSync(pattern).isDirectory()) {
		walk(pattern, results);
		return applyIgnoreGlobs(results);
	}

	walk(baseDir, results);
	return applyIgnoreGlobs(results.filter((f) => minimatch(f, pattern)));
}
