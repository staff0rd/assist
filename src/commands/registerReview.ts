import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { resolveHarness } from "./backlog/resolveHarness";
import { review } from "./review/review";
import { addReviewModeOptions } from "./review/addReviewModeOptions";
import { addReviewRunOptions } from "./review/addReviewRunOptions";
import type { ReviewOptions } from "./review/ReviewOptions";
import { reviewConfigHelp } from "./review/reviewConfigHelp";

type ReviewFlags = Omit<Required<ReviewOptions>, "harness"> & {
	harness?: string;
};

export function registerReview(program: Command): void {
	const reviewCommand = program
		.command("review")
		.description(
			"Run the Claude and Codex reviewers in parallel on the current branch's PR and synthesise their findings, or check out a PR by number first when given; --checkout-only just checks the PR out and leaves an idle session in the checkout tree",
		)
		.argument(
			"[number]",
			"Optional PR number; when provided, runs `gh pr checkout <number>` before reviewing",
		)
		.option(
			"--harness <kind>",
			"Coding harness (claude|codex|pi) for the interactive session that --refine, --apply, --backlog, --checkout-only or --high-level starts; defaults to the configured harness.engine. Exits with the reasons, before checking out or reviewing, when that session is unavailable on it. Reviewers and synthesis are not affected (see review.synthesisHarness)",
		);
	internalCommand(
		addReviewModeOptions(addReviewRunOptions(reviewCommand)).action(
			(number: string | undefined, options: ReviewFlags) =>
				review({
					...options,
					number,
					harness: resolveHarness(options.harness),
				}),
		),
		"the Review menu",
	);

	configHelp(
		reviewCommand,
		reviewConfigHelp,
		"With review.codexModel unset the codex reviewer runs on the user's own codex auth; when it is set but the LiteLLM proxy is not configured, the reviewer falls back to that plain codex run. A reviewer whose harness is unavailable is skipped with its reason, and the review stops before reviewing when the review.synthesisHarness cannot synthesise.",
	);
}
