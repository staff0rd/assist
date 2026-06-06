import type { Command } from "commander";
import { type ReviewOptions, review } from "./review";

export function registerReview(program: Command): void {
	program
		.command("review")
		.description(
			"Run Claude and Codex in parallel to review the current branch's PR, or check out a PR by number first when given",
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
			"--verbose",
			"Disable spinner UI and use per-line log output (per-tool lines, starting/done lines)",
		)
		.action((number: string | undefined, options: Required<ReviewOptions>) =>
			review({ ...options, number }),
		);
}
