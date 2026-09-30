export const reviewCiVariables = [
	"ASSIST_REVIEW_PROVIDER",
	"ASSIST_REVIEW_BASE_URL",
	"ASSIST_REVIEW_CLAUDE_MODEL",
	"ASSIST_REVIEW_CODEX_MODEL",
] as const;

export const reviewCiSecret = "ASSIST_REVIEW_API_KEY";

export type ReviewCiKey =
	| (typeof reviewCiVariables)[number]
	| typeof reviewCiSecret;

export const reviewCiKeys: ReviewCiKey[] = [
	...reviewCiVariables,
	reviewCiSecret,
];

export const reviewCiProviders = ["litellm", "foundry"] as const;
