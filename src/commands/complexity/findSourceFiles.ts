import fs from "node:fs";
import { minimatch } from "minimatch";
import { loadConfig } from "../../shared/loadConfig";
import { walkSourceFiles } from "./walkSourceFiles";

function applyIgnoreGlobs(
	files: string[],
	extraIgnore: string[] = [],
): string[] {
	const { complexity } = loadConfig();
	const ignore = [...complexity.ignore, ...extraIgnore];
	return files.filter((f) => !ignore.some((glob) => minimatch(f, glob)));
}

export function findSourceFiles(
	pattern: string,
	baseDir = ".",
	extraIgnore: string[] = [],
): string[] {
	const results: string[] = [];

	if (pattern.includes("*")) {
		walkSourceFiles(baseDir, results);
		return applyIgnoreGlobs(
			results.filter((f) => minimatch(f, pattern)),
			extraIgnore,
		);
	}

	if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
		return [pattern];
	}

	if (fs.existsSync(pattern) && fs.statSync(pattern).isDirectory()) {
		walkSourceFiles(pattern, results);
		return applyIgnoreGlobs(results, extraIgnore);
	}

	walkSourceFiles(baseDir, results);
	return applyIgnoreGlobs(
		results.filter((f) => minimatch(f, pattern)),
		extraIgnore,
	);
}
