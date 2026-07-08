import chalk from "chalk";
import { groupActivityRefs } from "../groupActivityRefs";
import type { BacklogItem, GitRef } from "../types";

function printRef(label: string, text: string, ref: GitRef): void {
	const url = ref.url ? ` ${chalk.dim(ref.url)}` : "";
	console.log(`  ${chalk.cyan(label)} ${text}${url}`);
}

export function printActivity(item: BacklogItem): void {
	const { branches, commits, prs, hiddenCommits } = groupActivityRefs(
		item.gitRefs ?? [],
	);
	if (branches.length + commits.length + prs.length === 0) return;

	console.log(chalk.bold("Activity"));
	for (const branch of branches) {
		printRef("branch", branch.ref, branch);
	}
	for (const commit of commits) {
		const subject = commit.title ? ` ${commit.title}` : "";
		printRef("commit", `${commit.ref.slice(0, 8)}${subject}`, commit);
	}
	if (hiddenCommits > 0) {
		console.log(`  ${chalk.dim(`… and ${hiddenCommits} more commits`)}`);
	}
	for (const pr of prs) {
		const title = pr.title ? ` ${pr.title}` : "";
		const state = pr.state
			? ` ${chalk.dim(`(${pr.state.toLowerCase()})`)}`
			: "";
		printRef("pr", `#${pr.ref}${title}${state}`, pr);
	}
	console.log();
}
