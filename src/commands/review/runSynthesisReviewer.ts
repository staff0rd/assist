import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { launchBlocker } from "../../shared/harnessAdapters/launchBlocker";
import { reviewSynthesisFeature } from "../../shared/harnessAdapters/reviewFeatures";
import type { HarnessKind } from "../../shared/harnesses";
import type { MultiSpinner } from "./MultiSpinner";
import { DEFAULT_SYNTHESIS_HARNESS } from "./resolveSynthesisHarness";
import { reviewerLabel } from "./reviewerLabel";
import { reviewModel } from "./reviewModel";
import type { ReviewerResult } from "./runStreamingChild";

type SynthesisSpec = {
	harness: HarnessKind;
	reviewDir: string;
	stdin: string;
	outputPath: string;
	multi: MultiSpinner | undefined;
};

const name = "synthesis";

export function synthesisBlocker(harness: HarnessKind): string | undefined {
	return launchBlocker(harnessAdapter(harness), reviewSynthesisFeature);
}

export function runSynthesisReviewer(
	spec: SynthesisSpec,
): Promise<ReviewerResult> {
	const blocker = synthesisBlocker(spec.harness);
	if (blocker)
		return Promise.resolve({
			name,
			outputPath: spec.outputPath,
			exitCode: 1,
			stderr: blocker,
		});
	const { multi } = spec;
	const tag =
		spec.harness === DEFAULT_SYNTHESIS_HARNESS ? undefined : spec.harness;
	return harnessAdapter(spec.harness).structured({
		name,
		stdin: spec.stdin,
		outputPath: spec.outputPath,
		readDir: spec.reviewDir,
		model: reviewModel(spec.harness),
		spinner:
			multi &&
			((model) =>
				multi.create(`${reviewerLabel(name, model ?? tag)} — starting`)),
	});
}
