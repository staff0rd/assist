import chalk from "chalk";
import { isoWeekRange } from "../isoWeek";
import type { DevEntry } from "../types";

type WeekState = {
	skipped: boolean;
	inProgress: boolean;
	entry: DevEntry | null;
};

function formatVersions(entry: DevEntry): string | null {
	const { firstVersion: first, lastVersion: last } = entry;
	if (!first || !last) return first ?? last;
	return first === last ? first : `${first} – ${last}`;
}

function describeEntry(entry: DevEntry): string {
	const versions = formatVersions(entry);
	const title = entry.title ?? chalk.dim("untitled");
	return versions ? `${chalk.green(versions)} ${title}` : title;
}

function describeWeek({ skipped, inProgress, entry }: WeekState): string {
	if (skipped) return chalk.dim("skipped");
	if (entry) return describeEntry(entry);
	if (inProgress) return chalk.dim("in progress");
	return chalk.red("⚠ dev entry missing");
}

export function printWeekHeader(week: string, state: WeekState): void {
	const { start, end } = isoWeekRange(week);
	console.log(
		`${chalk.bold.blue(week)} ${chalk.dim(`${start} – ${end}`)} ${describeWeek(state)}`,
	);
}
