import { emitActivity } from "../../shared/emitActivity";
import { findRepoRoot } from "../../shared/findRepoRoot";
import type { ReviewOptions } from "./ReviewOptions";
import { checkoutOnlySession } from "./checkoutOnlySession";
import { checkoutPr } from "./checkoutPr";
import { configureHighLevelReview } from "./highLevel/configureHighLevelReview";
import { runHighLevelReview } from "./highLevel/runHighLevelReview";
import { reviewPr } from "./reviewPr";
import { startReviewLog } from "./startReviewLog";
import { validateReviewOptions } from "./validateReviewOptions";

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	validateReviewOptions(options);
	if (options.configure) return configureHighLevelReview();
	startReviewLog();
	const invokedIn = resolveRepoRoot();
	if (options.checkoutOnly && options.number)
		return checkoutOnlySession(options.number);
	emitActivity({ kind: "command", name: "review" });
	if (!options.number)
		return options.highLevel
			? runHighLevelReview(undefined, { force: options.force })
			: reviewPr(invokedIn, options);
	await checkoutPr(options.number);
	if (options.highLevel)
		return runHighLevelReview(options.number, { force: options.force });
	return reviewPr(resolveRepoRoot(), options);
}
