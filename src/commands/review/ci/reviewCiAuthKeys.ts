import { type ReviewCiKey, reviewCiSecret } from "./reviewCiVariables";

export function reviewCiAuthKeys(
	provider: string,
	value: (key: ReviewCiKey) => string,
): ReviewCiKey[] {
	if (provider === "foundry" && value("ASSIST_REVIEW_AZURE_CLIENT_ID"))
		return ["ASSIST_REVIEW_AZURE_CLIENT_ID", "ASSIST_REVIEW_AZURE_TENANT_ID"];
	return [reviewCiSecret];
}
