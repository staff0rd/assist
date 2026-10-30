import type { Command } from "commander";

export function addReviewModeOptions(command: Command): Command {
	return command
		.option(
			"--checkout-only",
			"Check the PR out and start an idle interactive Claude session in the checkout tree instead of reviewing; requires a PR number and cannot be combined with --refine, --apply, --backlog or --submit",
		)
		.option(
			"--high-level",
			"Check the PR out and open the high-level review checklist in the web UI preview pane, then post it to the PR as an Approve, Comment or Request changes review. Outside a Claude session it starts one running /review-high-level <number>. A review saved for the same head SHA is reopened unless --force is passed. Cannot be combined with --refine, --apply, --backlog, --submit or --checkout-only",
		)
		.option(
			"--configure",
			"With --high-level: review nothing and instead ask for review.highLevel.criticalPaths, uiPaths and descriptionWordCap one at a time, each prefilled with its current value or, when unset, globs Claude proposes from this repo's own tree (for criticalPaths, merged with its defaults), then write the answers in one pass to either this repo's override in the shared assist database or the project assist.yml. A blank answer leaves that key unset",
		)
		.option(
			"--scope <scope>",
			"With --configure: write to 'db' (repo (db), this repo's override in the shared assist database) or 'git' (repo (git), the repo's own assist.yml) instead of asking which",
		)
		.option(
			"--answer <key=value>",
			"With --configure: answer one key without prompting, for an agent that has already put the choice to the user (repeatable); an empty value leaves that key unset. Answer all three and nothing is prompted for and no globs are proposed",
			collectAnswer,
			[],
		);
}

function collectAnswer(answer: string, answers: string[]): string[] {
	return [...answers, answer];
}
