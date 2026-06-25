import chalk from "chalk";
import { formatResultLine } from "./formatResultLine";
import { printMaintainabilityFailure } from "./printMaintainabilityFailure";
import type { ResultEntry } from "./ResultEntry";

export function displayMaintainabilityResults(
	results: ResultEntry[],
	threshold: number | undefined,
): void {
	const gating =
		threshold !== undefined || results.some((r) => r.override !== undefined);

	if (!gating) {
		for (const entry of results) console.log(formatResultLine(entry, false));
		console.log(chalk.dim(`\nAnalyzed ${results.length} files`));
		return;
	}

	const failing = results.filter((r) => {
		const limit = r.override ?? threshold;
		return limit !== undefined && r.minMaintainability < limit;
	});

	if (failing.length === 0) {
		console.log(chalk.green("All files pass maintainability threshold"));
	} else {
		for (const entry of failing) console.log(formatResultLine(entry, true));
	}

	const passingOverrides = results.filter(
		(r) => r.override !== undefined && !failing.includes(r),
	);
	for (const entry of passingOverrides)
		console.log(formatResultLine(entry, false));

	console.log(chalk.dim(`\nAnalyzed ${results.length} files`));

	if (failing.length > 0) {
		printMaintainabilityFailure(failing.length, threshold);
		process.exit(1);
	}
}
