import { isCompletedWeek, isoWeek } from "../isoWeek";
import type { Commit } from "../types";

export function groupCommitsByWeek(
	commitsByDate: Map<string, Commit[]>,
): Map<string, Commit[]> {
	const byWeek = new Map<string, Commit[]>();
	const dates = Array.from(commitsByDate.keys()).sort();
	for (const date of dates) {
		const week = isoWeek(date);
		const existing = byWeek.get(week) ?? [];
		const newestFirst = commitsByDate.get(date) ?? [];
		existing.push(...[...newestFirst].reverse());
		byWeek.set(week, existing);
	}
	return byWeek;
}

type TargetWeekFilter = {
	lastWeek: string | null;
	skip: Set<string>;
	today: string;
};

export function findTargetWeek(
	weeks: Iterable<string>,
	{ lastWeek, skip, today }: TargetWeekFilter,
): string | undefined {
	return Array.from(weeks)
		.filter((week) => !lastWeek || week > lastWeek)
		.filter((week) => !skip.has(week))
		.filter((week) => isCompletedWeek(week, today))
		.sort()[0];
}
