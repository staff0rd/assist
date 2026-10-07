export const reviewCiVariables = [
	"ASSIST_REVIEW_PROVIDER",
	"ASSIST_REVIEW_BASE_URL",
	"ASSIST_REVIEW_REVIEWER_1",
	"ASSIST_REVIEW_REVIEWER_2",
	"ASSIST_REVIEW_SYNTHESIS",
] as const;

export const reviewCiEntraVariables = [
	"ASSIST_REVIEW_AZURE_CLIENT_ID",
	"ASSIST_REVIEW_AZURE_TENANT_ID",
	"ASSIST_REVIEW_ENVIRONMENT",
] as const;

export const reviewCiSecret = "ASSIST_REVIEW_API_KEY";

export type ReviewCiVariable = (typeof reviewCiVariables)[number];

export type ReviewCiKey =
	| ReviewCiVariable
	| (typeof reviewCiEntraVariables)[number]
	| typeof reviewCiSecret;

export const reviewCiProviders = ["litellm", "foundry"] as const;

export const reviewCiHarnesses = ["claude", "codex"] as const;
