import chalk from "chalk";
import type { HighLevelCriticalDiff } from "./types";

const PATCH_LINE_COLOURS: Record<string, (line: string) => string> = {
	"+": chalk.green,
	"-": chalk.red,
	"@": chalk.cyan,
};

function formatPatch(patch: string): string[] {
	return patch
		.split("\n")
		.map(
			(line) => `    ${(PATCH_LINE_COLOURS[line[0] ?? ""] ?? chalk.dim)(line)}`,
		);
}

function formatDiff(diff: HighLevelCriticalDiff): string[] {
	return [
		"",
		`  ${chalk.bold(diff.path)} ${chalk.dim(`(${diff.status})`)} ${chalk.green(`+${diff.additions}`)} ${chalk.red(`-${diff.deletions}`)}`,
		...(diff.patch === null
			? [`    ${chalk.dim(`no diff available; see ${diff.diffUrl}`)}`]
			: formatPatch(diff.patch)),
	];
}

export function formatCriticalDiffs(
	diffs: HighLevelCriticalDiff[],
	criticalPaths: string[],
): string {
	if (criticalPaths.length === 0)
		return `${chalk.bold.underline("Critical diffs")}\n  ${chalk.dim("review.highLevel.criticalPaths is unset, so no diffs are shown")}`;
	if (diffs.length === 0)
		return `${chalk.bold.underline("Critical diffs")}\n  ${chalk.dim(`no changed file matches ${criticalPaths.join(", ")}`)}`;
	return [
		chalk.bold.underline("Critical diffs"),
		...diffs.flatMap(formatDiff),
	].join("\n");
}
