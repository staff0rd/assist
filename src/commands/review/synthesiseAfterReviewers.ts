import { existsSync, unlinkSync } from "node:fs";
import type { ReviewPaths } from "./buildReviewPaths";
import type { MultiSpinner } from "./MultiSpinner";
import type { ReviewerResult } from "./runStreamingChild";
import { synthesise } from "./synthesise";

type SynthesisInput = {
	paths: ReviewPaths;
	results: ReviewerResult[];
	failures: ReviewerResult[];
	anyFresh: boolean;
	multi: MultiSpinner | undefined;
};

export async function synthesiseAfterReviewers(input: SynthesisInput) {
	const { paths, failures } = input;
	if (input.anyFresh && existsSync(paths.synthesisPath)) {
		unlinkSync(paths.synthesisPath);
	}
	const synthesisResult = await synthesise(paths, { multi: input.multi });
	if (synthesisResult.exitCode !== 0) failures.push(synthesisResult);
	return {
		ok: synthesisResult.exitCode === 0,
		failures,
		slots: [...input.results, synthesisResult],
	};
}
