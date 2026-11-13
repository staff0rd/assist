import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
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
			"Coding harness (claude|codex|pi) for the interactive session that --refine, --apply, --backlog, --checkout-only or --high-level starts, and for the Address Comments session --address-comments chains; defaults to the configured harness.engine. Exits with the reasons, before checking out or reviewing, when that session is unavailable on it. Reviewers and synthesis are not affected (see review.synthesisHarness)",
		);
	internalCommand(
		addReviewModeOptions(addReviewRunOptions(reviewCommand)).action(
			async (number: string | undefined, options: ReviewFlags) => {
				const { resolveHarness } = await import("./backlog/resolveHarness");
				const { review } = await import("./review/review");
				return review({
					...options,
					number,
					harness: resolveHarness(options.harness),
				});
			},
		),
		"the Review menu",
	);

	configHelp(
		reviewCommand,
		reviewConfigHelp,
		"With review.codexModel unset or codex-default the codex reviewer runs on the user's own codex auth and configured model (set codex-default in a repo to override an inherited value); when it is set but the LiteLLM proxy is not configured, the reviewer falls back to that plain codex run. A reviewer whose harness is unavailable is skipped with its reason, and the review stops before reviewing when the review.synthesisHarness cannot synthesise.",
	);
}
