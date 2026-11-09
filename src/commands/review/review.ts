import { isAgentHarness } from "../../lib/isAgentHarness";
import { emitActivity } from "../../shared/emitActivity";
import { findRepoRoot } from "../../shared/findRepoRoot";
import type { ReviewOptions } from "./ReviewOptions";
import { checkoutPrSession } from "./checkoutPrSession";
import { checkoutPr } from "./checkoutPr";
import { configureHighLevelReview } from "./highLevel/configureHighLevelReview";
import { runHighLevelReview } from "./highLevel/runHighLevelReview";
import { reviewPr } from "./reviewPr";
import { startReviewLog } from "./startReviewLog";
import { validateReviewOptions } from "./validateReviewOptions";
import { sessionBlocked } from "./sessionBlocked";

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	validateReviewOptions(options);
	if (options.configure)
		return configureHighLevelReview({
			scope: options.scope,
			answer: options.answer,
		});
	if (sessionBlocked(options)) return;
	startReviewLog();
	const invokedIn = resolveRepoRoot();
	const { harness } = options;
	if (options.checkoutOnly && options.number)
		return checkoutPrSession(options.number, { harness });
	if (options.highLevel && options.number && !isAgentHarness())
		return checkoutPrSession(options.number, {
			harness,
			skill: {
				name: "review-high-level",
				args: `${options.number}${options.force ? " --force" : ""}`,
			},
		});
	emitActivity({ kind: "command", name: "review" });
	const highLevelOptions = { force: options.force, slices: options.slices };
	if (!options.number)
		return options.highLevel
			? runHighLevelReview(undefined, highLevelOptions)
			: reviewPr(invokedIn, options);
	await checkoutPr(options.number);
	if (options.highLevel)
		return runHighLevelReview(options.number, highLevelOptions);
	return reviewPr(resolveRepoRoot(), options);
}
