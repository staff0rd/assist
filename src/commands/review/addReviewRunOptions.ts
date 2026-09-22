import type { Command } from "commander";

export function addReviewRunOptions(command: Command): Command {
	return command
		.option(
			"--no-prompt",
			"Skip confirmation prompts; use flag defaults non-interactively",
		)
		.option(
			"--submit",
			"Default the submit prompt to yes (or auto-submit with --no-prompt)",
		)
		.option(
			"--force",
			"Clear cached claude.md / codex.md / synthesis.md and re-run all phases; with --high-level, discard the review saved for this head SHA and start fresh",
		)
		.option(
			"--refine",
			"After synthesis, launch an interactive Claude session to walk through findings instead of posting",
		)
		.option(
			"--apply",
			"After synthesis, launch an interactive Claude session to apply fixes for each finding; applied findings are removed from synthesis, skipped ones remain for a later post",
		)
		.option(
			"--backlog",
			"After synthesis, launch an interactive Claude session running /bug to file all findings as a single backlog item with one phase per finding, instead of posting to the PR",
		)
		.option(
			"--address-comments",
			"After posting and submitting the review, start an Address Comments session (assist review-pr-comments <n>) for the PR; no-op when nothing was posted or the review was not submitted, and only inside an assist session",
		)
		.option(
			"--announce",
			"Announce the PR in Slack (/prs-slack <n> --no-confirm) once the chain finishes: from the Address Comments session when one was started, otherwise from a session started directly; only inside an assist session",
		)
		.option(
			"--verbose",
			"Disable spinner UI and use per-line log output (per-tool lines, starting/done lines)",
		);
}
