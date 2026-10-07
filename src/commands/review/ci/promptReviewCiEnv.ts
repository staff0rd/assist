import { askReviewCiKey } from "./askReviewCiKey";
import {
	type ReviewCiKey,
	reviewCiSecret,
	reviewCiVariables,
} from "./reviewCiVariables";

export async function promptReviewCiEnv(
	flags: Partial<Record<ReviewCiKey, string>>,
	env: NodeJS.ProcessEnv,
): Promise<Partial<Record<ReviewCiKey, string>>> {
	const given = { ...flags, [reviewCiSecret]: env[reviewCiSecret] };
	const result: Partial<Record<ReviewCiKey, string>> = {};
	for (const key of reviewCiVariables)
		result[key] = await askReviewCiKey(key, given);

	if (result.REVIEW_CI_PROVIDER === "foundry") {
		const clientId = await askReviewCiKey(
			"REVIEW_CI_AZURE_CLIENT_ID",
			given,
			true,
		);
		if (clientId) {
			result.REVIEW_CI_AZURE_CLIENT_ID = clientId;
			result.REVIEW_CI_AZURE_TENANT_ID = await askReviewCiKey(
				"REVIEW_CI_AZURE_TENANT_ID",
				given,
			);
			result.REVIEW_CI_ENVIRONMENT = await askReviewCiKey(
				"REVIEW_CI_ENVIRONMENT",
				given,
				true,
			);
			return result;
		}
	}
	result[reviewCiSecret] = await askReviewCiKey(reviewCiSecret, given);
	return result;
}
