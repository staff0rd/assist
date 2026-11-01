import chalk from "chalk";
import { addDays, isoWeek, isoWeekRange, isValidWeek } from "../isoWeek";

type ListOptions = {
	weeks?: number;
	ignore?: string[];
	reverse?: boolean;
	since?: string;
	verbose?: boolean;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function resolveListAfterDate(
	options: Pick<ListOptions, "since" | "weeks">,
	today: string,
): string {
	if (options.since) return addDays(resolveSinceDate(options.since), -1);
	const weeks = Math.max(1, options.weeks ?? 6);
	const currentMonday = isoWeekRange(isoWeek(today)).start;
	return addDays(currentMonday, -7 * (weeks - 1) - 1);
}

function resolveSinceDate(since: string): string {
	if (isValidWeek(since)) return isoWeekRange(since).start;
	if (DATE_PATTERN.test(since)) return since;
	console.log(
		chalk.red("Invalid --since. Use YYYY-MM-DD or YYYY-Www (e.g. 2026-W33)"),
	);
	process.exit(1);
}
