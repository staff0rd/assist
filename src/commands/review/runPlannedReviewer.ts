import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import type { MultiSpinner } from "./MultiSpinner";
import type { PlannedReviewer } from "./planReviewers";
import { reviewerLabel } from "./reviewerLabel";
import { reviewModel } from "./reviewModel";
import type { ReviewerResult } from "./runStreamingChild";

export type ReviewerRunContext = {
	reviewDir: string;
	stdin: string;
	multi: MultiSpinner | undefined;
};

export function runPlannedReviewer(
	{ slot, plan }: PlannedReviewer,
	{ reviewDir, stdin, multi }: ReviewerRunContext,
): Promise<ReviewerResult> {
	if (plan.kind === "cached") return Promise.resolve(plan.cached);
	if (plan.kind === "skipped")
		return Promise.resolve({
			name: slot.name,
			outputPath: slot.outputPath,
			exitCode: 0,
			stderr: "",
			skipped: true,
		});
	return harnessAdapter(slot.harness).structured({
		name: slot.name,
		stdin,
		outputPath: slot.outputPath,
		readDir: reviewDir,
		model: reviewModel(slot.harness),
		spinner:
			multi &&
			((model) =>
				multi.create(`${reviewerLabel(slot.name, model)} — starting`)),
	});
}
