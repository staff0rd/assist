import chalk from "chalk";
import type { LineBoundFinding } from "./partitionFindings";

export function warnOutOfDiff(outOfDiff: LineBoundFinding[]): void {
	if (outOfDiff.length === 0) return;
	console.warn(
		chalk.yellow(
			`Skipped ${outOfDiff.length} finding(s) whose lines fall outside the PR diff (GitHub would silently drop these):`,
		),
	);
	for (const finding of outOfDiff) {
		const range =
			finding.startLine !== undefined
				? `${finding.startLine}-${finding.line}`
				: `${finding.line}`;
		console.warn(
			`  ${chalk.yellow("·")} ${finding.title} ${chalk.dim(
				`(${finding.file}:${range})`,
			)}`,
		);
	}
}
