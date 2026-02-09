import fs from "node:fs";
import {
	calculateCyclomaticComplexity,
	calculateHalstead,
	countSloc,
	forEachFunction,
	type ThresholdOptions,
	withSourceFiles,
} from "../shared";
import {
	displayMaintainabilityResults,
	type ResultEntry,
} from "./displayMaintainabilityResults";

function calculateMaintainabilityIndex(
	halsteadVolume: number,
	cyclomaticComplexity: number,
	sloc: number,
): number {
	if (halsteadVolume === 0 || sloc === 0) {
		return 100;
	}
	const mi =
		171 -
		5.2 * Math.log(halsteadVolume) -
		0.23 * cyclomaticComplexity -
		16.2 * Math.log(sloc);
	return Math.max(0, Math.min(100, mi));
}

type FileMetrics = Map<string, { sloc: number; functions: number[] }>;

function collectFileMetrics(files: string[]): FileMetrics {
	const fileMetrics: FileMetrics = new Map();

	for (const file of files) {
		const content = fs.readFileSync(file, "utf-8");
		fileMetrics.set(file, { sloc: countSloc(content), functions: [] });
	}

	forEachFunction(files, (file, _name, node) => {
		const metrics = fileMetrics.get(file);
		if (metrics) {
			const complexity = calculateCyclomaticComplexity(node);
			const halstead = calculateHalstead(node);
			const mi = calculateMaintainabilityIndex(
				halstead.volume,
				complexity,
				metrics.sloc,
			);
			metrics.functions.push(mi);
		}
	});

	return fileMetrics;
}

function aggregateResults(fileMetrics: FileMetrics): ResultEntry[] {
	const results: ResultEntry[] = [];

	for (const [file, metrics] of fileMetrics) {
		if (metrics.functions.length === 0) continue;
		const avgMaintainability =
			metrics.functions.reduce((a, b) => a + b, 0) / metrics.functions.length;
		const minMaintainability = Math.min(...metrics.functions);
		results.push({ file, avgMaintainability, minMaintainability });
	}

	results.sort((a, b) => a.minMaintainability - b.minMaintainability);
	return results;
}

export async function maintainability(
	pattern = "**/*.ts",
	options: ThresholdOptions = {},
): Promise<void> {
	withSourceFiles(pattern, (files) => {
		const fileMetrics = collectFileMetrics(files);
		const results = aggregateResults(fileMetrics);
		displayMaintainabilityResults(results, options.threshold);
	});
}
