import chalk from "chalk";

export function printMaintainabilityFailure(
	failingCount: number,
	threshold: number | undefined,
): void {
	const thresholdLabel = threshold !== undefined ? ` ${threshold}` : "";
	console.error(
		chalk.red(
			`\nFail: ${failingCount} file(s) below threshold${thresholdLabel} (files marked "override threshold" were judged against their own marker). Maintainability index (0–100) is derived from Halstead volume, cyclomatic complexity, and lines of code.\n\n⚠️  ${chalk.bold("Diagnose and fix one file at a time")} — do not investigate or fix multiple files in parallel.\n\nThe score is a property of the whole file, not your diff: any existing logic counts, so the fix is to shrink the file — not to revert or micro-optimize the lines you just changed. Identify the largest cohesive responsibility (often the biggest function, or a related group of functions) and move it to a new file with 'assist refactor extract'. Run 'assist complexity <file>' for per-function metrics only to locate that responsibility, not to tweak individual lines.`,
		),
	);
}
