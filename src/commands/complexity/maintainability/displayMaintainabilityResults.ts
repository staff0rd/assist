import chalk from "chalk";
import { formatResultLine } from "./formatResultLine";
import {
	getMaintainabilityGitState,
	type MaintainabilityGitState,
} from "./getMaintainabilityGitState";
import { printMaintainabilityFailure } from "./printMaintainabilityFailure";
import { printMaintainabilityFormula } from "./printMaintainabilityFormula";
import type { ResultEntry } from "./ResultEntry";

export function displayMaintainabilityResults(
	results: ResultEntry[],
	threshold: number | undefined,
	gitState: MaintainabilityGitState = getMaintainabilityGitState(),
): void {
	const gating =
		threshold !== undefined || results.some((r) => r.override !== undefined);

	if (!gating) {
		printMaintainabilityFormula();
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
	}

	const passingOverrides = results.filter(
		(r) => r.override !== undefined && !failing.includes(r),
	);
	for (const entry of passingOverrides)
		console.log(formatResultLine(entry, false));

	console.log(chalk.dim(`\nAnalyzed ${results.length} files`));

	if (failing.length > 0) {
		printMaintainabilityFailure(failing, gitState);
		process.exit(1);
	}
}
