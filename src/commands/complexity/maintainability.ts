import fs from "node:fs";
import chalk from "chalk";
import {
	calculateCyclomaticComplexity,
	calculateHalstead,
	countSloc,
	forEachFunction,
	type ThresholdOptions,
	withSourceFiles,
} from "./shared";

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
type ResultEntry = {
	file: string;
	avgMaintainability: number;
	minMaintainability: number;
};

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

function displayResults(
	results: ResultEntry[],
	threshold: number | undefined,
): void {
	const filtered =
		threshold !== undefined
			? results.filter((r) => r.minMaintainability < threshold)
			: results;

	if (threshold !== undefined && filtered.length === 0) {
		console.log(chalk.green("All files pass maintainability threshold"));
	} else {
		for (const { file, avgMaintainability, minMaintainability } of filtered) {
			const color = threshold !== undefined ? chalk.red : chalk.white;
			console.log(
				`${color(file)} → avg: ${chalk.cyan(avgMaintainability.toFixed(1))}, min: ${chalk.yellow(minMaintainability.toFixed(1))}`,
			);
		}
	}

	console.log(chalk.dim(`\nAnalyzed ${results.length} files`));

	if (filtered.length > 0 && threshold !== undefined) {
		console.error(
			chalk.red(
				`\nFail: ${filtered.length} file(s) below threshold ${threshold}. Maintainability index (0–100) is derived from Halstead volume, cyclomatic complexity, and lines of code. Try 'complexity cyclomatic', 'complexity halstead', or 'complexity sloc' to help identify which metric is contributing most. For larger files, start by extracting responsibilities into smaller files.`,
			),
		);
		process.exit(1);
	}
}

export async function maintainability(
	pattern = "**/*.ts",
	options: ThresholdOptions = {},
): Promise<void> {
	withSourceFiles(pattern, (files) => {
		const fileMetrics = collectFileMetrics(files);
		const results = aggregateResults(fileMetrics);
		displayResults(results, options.threshold);
	});
}
