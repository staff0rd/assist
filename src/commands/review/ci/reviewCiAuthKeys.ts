import { type ReviewCiKey, reviewCiSecret } from "./reviewCiVariables";

export function reviewCiAuthKeys(
	provider: string,
	value: (key: ReviewCiKey) => string,
): ReviewCiKey[] {
	if (provider === "foundry" && value("REVIEW_CI_AZURE_CLIENT_ID"))
		return ["REVIEW_CI_AZURE_CLIENT_ID", "REVIEW_CI_AZURE_TENANT_ID"];
	return [reviewCiSecret];
}
