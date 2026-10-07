export const reviewCiVariables = [
	"REVIEW_CI_PROVIDER",
	"REVIEW_CI_BASE_URL",
	"REVIEW_CI_REVIEWER_1",
	"REVIEW_CI_REVIEWER_2",
	"REVIEW_CI_SYNTHESIS",
] as const;

export const reviewCiEntraVariables = [
	"REVIEW_CI_AZURE_CLIENT_ID",
	"REVIEW_CI_AZURE_TENANT_ID",
	"REVIEW_CI_ENVIRONMENT",
] as const;

export const reviewCiSecret = "REVIEW_CI_API_KEY";

export type ReviewCiVariable = (typeof reviewCiVariables)[number];

export type ReviewCiKey =
	| ReviewCiVariable
	| (typeof reviewCiEntraVariables)[number]
	| typeof reviewCiSecret;

export const reviewCiProviders = ["litellm", "foundry"] as const;

export const reviewCiHarnesses = ["claude", "codex"] as const;
