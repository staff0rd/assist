import chalk from "chalk";
import { groupActivityRefs } from "../groupActivityRefs";
import { refLabel } from "../refLabel";
import type { BacklogItem, GitRef } from "../types";

function printRef(ref: GitRef): void {
	const url = ref.url ? ` ${chalk.dim(ref.url)}` : "";
	const approvedAt =
		ref.kind === "docs-unlock" && ref.createdAt
			? ` ${chalk.dim(ref.createdAt)}`
			: "";
	console.log(`  ${chalk.cyan(ref.kind)} ${refLabel(ref)}${url}${approvedAt}`);
}

export function printActivity(
	item: BacklogItem,
	options: { allCommits?: boolean } = {},
): void {
	const {
		docsUnlocks,
		branches,
		commits,
		overflowCommits,
		prs,
		slacks,
		sessions,
	} = groupActivityRefs(
		item.gitRefs ?? [],
		options.allCommits ? Number.POSITIVE_INFINITY : undefined,
	);
	const ordered = [
		...docsUnlocks,
		...branches,
		...commits,
		...prs,
		...slacks,
		...sessions,
	];
	if (ordered.length === 0) return;

	console.log(chalk.bold("Activity"));
	for (const unlock of docsUnlocks) printRef(unlock);
	for (const branch of branches) printRef(branch);
	for (const commit of commits) printRef(commit);
	if (overflowCommits.length > 0) {
		console.log(
			`  ${chalk.dim(`… and ${overflowCommits.length} more commits (--all-commits to show)`)}`,
		);
	}
	for (const pr of prs) printRef(pr);
	for (const slack of slacks) printRef(slack);
	for (const session of sessions) printRef(session);
	console.log();
}
