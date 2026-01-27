import chalk from "chalk";
import {
	calculateCyclomaticComplexity,
	forEachFunction,
	type ThresholdOptions,
	withSourceFiles,
} from "./shared";

export async function cyclomatic(
	pattern = "**/*.ts",
	options: ThresholdOptions = {},
): Promise<void> {
	withSourceFiles(pattern, (files) => {
		const results: { file: string; name: string; complexity: number }[] = [];
		let hasViolation = false;

		forEachFunction(files, (file, name, node) => {
			const complexity = calculateCyclomaticComplexity(node);
			results.push({ file, name, complexity });
			if (options.threshold !== undefined && complexity > options.threshold) {
				hasViolation = true;
			}
		});

		results.sort((a, b) => b.complexity - a.complexity);

		for (const { file, name, complexity } of results) {
			const exceedsThreshold =
				options.threshold !== undefined && complexity > options.threshold;
			const color = exceedsThreshold ? chalk.red : chalk.white;
			console.log(`${color(`${file}:${name}`)} → ${chalk.cyan(complexity)}`);
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
