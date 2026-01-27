import chalk from "chalk";
import {
	calculateHalstead,
	forEachFunction,
	type HalsteadMetrics,
	type ThresholdOptions,
	withSourceFiles,
} from "./shared";

export async function halstead(
	pattern = "**/*.ts",
	options: ThresholdOptions = {},
): Promise<void> {
	withSourceFiles(pattern, (files) => {
		const results: { file: string; name: string; metrics: HalsteadMetrics }[] =
			[];
		let hasViolation = false;

		forEachFunction(files, (file, name, node) => {
			const metrics = calculateHalstead(node);
			results.push({ file, name, metrics });
			if (
				options.threshold !== undefined &&
				metrics.volume > options.threshold
			) {
				hasViolation = true;
			}
		});

		results.sort((a, b) => b.metrics.effort - a.metrics.effort);

		for (const { file, name, metrics } of results) {
			const exceedsThreshold =
				options.threshold !== undefined && metrics.volume > options.threshold;
			const color = exceedsThreshold ? chalk.red : chalk.white;
			console.log(
				`${color(`${file}:${name}`)} → volume: ${chalk.cyan(metrics.volume.toFixed(1))}, difficulty: ${chalk.yellow(metrics.difficulty.toFixed(1))}, effort: ${chalk.magenta(metrics.effort.toFixed(1))}`,
			);
		}

		console.log(
			chalk.dim(
				`\nAnalyzed ${results.length} functions across ${files.length} files`,
			),
		);

		if (hasViolation) {
			process.exit(1);
		}
	});
}
