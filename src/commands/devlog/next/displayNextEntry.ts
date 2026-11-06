import chalk from "chalk";
import { isoWeekRange } from "../isoWeek";
import type { Commit } from "../types";
import { resolveVersionSource } from "../resolveVersionSource";
import { repoHasTags } from "./repoHasTags";
import { type VersionedCommit, withVersions } from "./withVersions";
import { printCommits } from "./printCommits";

function versionRange(commits: VersionedCommit[]): string | null {
	const versions = commits
		.map((c) => c.version)
		.filter((v): v is string => v !== null);
	if (versions.length === 0) return null;
	const first = versions[0];
	const last = versions[versions.length - 1];
	return first === last ? first : `${first} – ${last}`;
}

function printField(label: string, value: string): void {
	console.log(`${chalk.bold(`${label}:`)} ${value}`);
}

type DisplayContext = {
	repoName: string;
	ignore: string[];
	verbose: boolean;
};

export function displayNextEntry(
	ctx: DisplayContext,
	week: string,
	commits: Commit[],
): void {
	const versioned = withVersions(
		commits,
		resolveVersionSource(),
		repoHasTags(),
	);
	const { start, end } = isoWeekRange(week);
	printField("name", ctx.repoName);
	printField("week", chalk.bold.blue(week));
	printField("range", `${start} – ${end}`);
	const dates = commits.map((c) => c.date).sort();
	if (dates.length > 0) printField("dates", `${dates[0]} – ${dates.at(-1)}`);
	const versions = versionRange(versioned);
	if (versions) printField("versions", versions);
	printCommits(versioned, ctx.ignore, ctx.verbose);
}

export function logNoCommits(lastWeek: string | null): void {
	console.log(
		chalk.dim(
			lastWeek
				? `No completed weeks with commits after ${lastWeek}`
				: "No completed weeks with commits found",
		),
	);
}
