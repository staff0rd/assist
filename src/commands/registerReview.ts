import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { review } from "./review/review";
import { addReviewModeOptions } from "./review/addReviewModeOptions";
import { addReviewRunOptions } from "./review/addReviewRunOptions";
import type { ReviewOptions } from "./review/ReviewOptions";
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
		);
	addReviewModeOptions(addReviewRunOptions(reviewCommand)).action(
		(number: string | undefined, options: Required<ReviewOptions>) =>
			review({ ...options, number }),
	);

	configHelp(
		reviewCommand,
		reviewConfigHelp,
		"With review.codexModel unset the codex reviewer runs on the user's own codex auth; when it is set but the LiteLLM proxy is not configured, the reviewer falls back to that plain codex run.",
	);
}
