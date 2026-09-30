import { checkCliAvailable } from "../../../shared/checkCliAvailable";
import { pinCurrentPr } from "../../prs/pinCurrentPr";
import { reviewPr } from "../reviewPr";
import { buildCiReviewerModels } from "./buildCiReviewerModels";
import { deriveEndpoints } from "./deriveEndpoints";
import { readEventPrNumber } from "./readEventPrNumber";
import { readReviewCiEnv } from "./readReviewCiEnv";

export async function reviewCiReview(env: NodeJS.ProcessEnv): Promise<void> {
	const { config, missing } = readReviewCiEnv(env);
	if (!config) throw new Error(`${missing.join(", ")} not set`);
	const endpoints = deriveEndpoints(config.provider, config.baseUrl);
	for (const cli of ["claude", "codex"])
		if (!checkCliAvailable(cli)) throw new Error(`${cli} is not on PATH`);
	pinCurrentPr(readEventPrNumber(env));
	await reviewPr(process.cwd(), {
		prompt: false,
		submit: true,
		force: true,
		verbose: true,
		ci: { models: buildCiReviewerModels(config, endpoints) },
	});
}

try {
	await reviewCiReview(process.env);
} catch (error) {
	console.error(
		`review-ci: ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exit(1);
}
