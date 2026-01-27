import fs from "node:fs";
import chalk from "chalk";
import { countSloc, type ThresholdOptions, withSourceFiles } from "./shared";

export async function sloc(
	pattern = "**/*.ts",
	options: ThresholdOptions = {},
): Promise<void> {
	withSourceFiles(pattern, (files) => {
		const results: { file: string; lines: number }[] = [];
		let hasViolation = false;

		for (const file of files) {
			const content = fs.readFileSync(file, "utf-8");
			const lines = countSloc(content);
			results.push({ file, lines });
			if (options.threshold !== undefined && lines > options.threshold) {
				hasViolation = true;
			}
		}

		results.sort((a, b) => b.lines - a.lines);

		for (const { file, lines } of results) {
			const exceedsThreshold =
				options.threshold !== undefined && lines > options.threshold;
			const color = exceedsThreshold ? chalk.red : chalk.white;
			console.log(`${color(file)} → ${chalk.cyan(lines)} lines`);
		}

		const total = results.reduce((sum, r) => sum + r.lines, 0);
		console.log(
			chalk.dim(`\nTotal: ${total} lines across ${files.length} files`),
		);

		if (hasViolation) {
			process.exit(1);
		}
	});
}
