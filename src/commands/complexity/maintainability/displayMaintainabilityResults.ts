import chalk from "chalk";

export type ResultEntry = {
	file: string;
	avgMaintainability: number;
	minMaintainability: number;
};

export function displayMaintainabilityResults(
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
				`\nFail: ${filtered.length} file(s) below threshold ${threshold}. Maintainability index (0–100) is derived from Halstead volume, cyclomatic complexity, and lines of code.\n\n⚠️  ${chalk.bold("Fix only one file at a time")} — run 'assist complexity <file>' to see all metrics. For larger files, start by extracting responsibilities into smaller files.`,
			),
		);
		process.exit(1);
	}
}
