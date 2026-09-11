import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { type ReviewOptions, review } from "./review";
import { reviewConfigHelp } from "./review/reviewConfigHelp";

export function registerReview(program: Command): void {
	const reviewCommand = program
		.command("review")
		.description(
			"Run Claude and Codex in parallel to review the current branch's PR, or check out a PR by number first when given; --checkout-only just checks the PR out and leaves an idle Claude session in the checkout tree",
		)
		.argument(
			"[number]",
			"Optional PR number; when provided, runs `gh pr checkout <number>` before reviewing",
		)
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
			"Clear cached claude.md / codex.md / synthesis.md and re-run all phases",
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
			"--checkout-only",
			"Check the PR out and start an idle interactive Claude session in the checkout tree instead of reviewing; requires a PR number and cannot be combined with --refine, --apply, --backlog or --submit",
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
		)
		.action((number: string | undefined, options: Required<ReviewOptions>) =>
			review({ ...options, number }),
		);

	configHelp(
		reviewCommand,
		reviewConfigHelp,
		"With review.codexModel unset the codex reviewer runs on the user's own codex auth; when it is set but the LiteLLM proxy is not configured, the reviewer falls back to that plain codex run.",
	);
}
