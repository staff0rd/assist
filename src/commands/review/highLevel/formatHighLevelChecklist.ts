import chalk from "chalk";
import type { HighLevelCheckResult } from "./types";

const MARKERS = {
	pass: () => chalk.green("✔"),
	fail: () => chalk.red("✘"),
	manual: () => chalk.yellow("□"),
} as const;

function formatCheck(check: HighLevelCheckResult): string {
	const title =
		check.status === "fail" ? chalk.red(check.title) : chalk.bold(check.title);
	return `  ${MARKERS[check.status]()} ${title}\n      ${chalk.dim(check.reason)}`;
}

function formatGroup(
	heading: string,
	checks: HighLevelCheckResult[],
): string[] {
	if (checks.length === 0) return [];
	return ["", chalk.bold.underline(heading), ...checks.map(formatCheck)];
}

export function formatHighLevelChecklist(
	checks: HighLevelCheckResult[],
): string {
	const deterministic = checks.filter(
		(check) => check.kind === "deterministic",
	);
	const failed = deterministic.filter(
		(check) => check.status === "fail",
	).length;
	const summary =
		failed === 0
			? chalk.green(`All ${deterministic.length} deterministic checks pass`)
			: chalk.red(
					`${failed} of ${deterministic.length} deterministic checks fail`,
				);
	return [
		...formatGroup("Deterministic", deterministic),
		...formatGroup(
			"Manual",
			checks.filter((check) => check.kind === "manual"),
		),
		"",
		summary,
	].join("\n");
}
