import type { Command } from "commander";

export function addReviewModeOptions(command: Command): Command {
	return command
		.option(
			"--checkout-only",
			"Check the PR out and start an idle interactive Claude session in the checkout tree instead of reviewing; requires a PR number and cannot be combined with --refine, --apply, --backlog or --submit",
		)
		.option(
			"--high-level",
			"Skip the LLM review; check the PR branch out and step through the high-level review checklist in the web UI preview pane, backed by the changed-file tree and the diffs of review.highLevel.criticalPaths, writing the verdict, per-item state and comments to ~/.assist/high-level-reviews/. A review already saved for the same head SHA is reopened unless --force is passed. Nothing is posted to GitHub; cannot be combined with --refine, --apply, --backlog, --submit or --checkout-only",
		)
		.option(
			"--configure",
			"With --high-level: review nothing and instead ask for review.highLevel.criticalPaths, uiPaths and descriptionWordCap one at a time, each prefilled with its current value or, when unset, globs Claude proposes from this repo's own tree, then write the answers in one pass to either the project assist.yml or this repo's block in ~/.assist.yml. A blank answer leaves that key unset",
		)
		.option(
			"--scope <scope>",
			"With --configure: write to 'project' (the repo's own assist.yml) or 'repo' (this repo's block in ~/.assist.yml) instead of asking which",
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
