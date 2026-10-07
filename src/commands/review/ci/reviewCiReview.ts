import { checkCliAvailable } from "../../../shared/checkCliAvailable";
import { pinCurrentPr } from "../../prs/pinCurrentPr";
import { reviewPr } from "../reviewPr";
import { buildCiReviewerModels } from "./buildCiReviewerModels";
import { deriveEndpoints } from "./deriveEndpoints";
import { readEventPrNumber } from "./readEventPrNumber";
import { readReviewCiEnv } from "./readReviewCiEnv";
import { resolveReviewCiToken } from "./resolveReviewCiToken";

export async function reviewCiReview(env: NodeJS.ProcessEnv): Promise<void> {
	const { config, errors } = readReviewCiEnv(env);
	if (!config) throw new Error(errors.join("; "));
	const endpoints = deriveEndpoints(config.provider, config.baseUrl);
	const harnesses = new Set(
		Object.values(config.slots).map((slot) => slot.harness),
	);
	for (const cli of harnesses)
		if (!checkCliAvailable(cli)) throw new Error(`${cli} is not on PATH`);
	const token = await resolveReviewCiToken(config.auth, env);
	pinCurrentPr(readEventPrNumber(env));
	await reviewPr(process.cwd(), {
		prompt: false,
		submit: true,
		force: true,
		verbose: true,
		ci: { models: buildCiReviewerModels(config, endpoints, token) },
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
