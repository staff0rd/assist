import { reviewCiKeys, reviewCiSecret } from "./reviewCiVariables";

export type ReviewCiConfig = {
	provider: string;
	baseUrl: string;
	claudeModel: string;
	codexModel: string;
	apiKey: string;
};

export function readReviewCiEnv(env: NodeJS.ProcessEnv): {
	config: ReviewCiConfig | null;
	missing: string[];
} {
	const value = (key: string) => env[key]?.trim() ?? "";
	const missing = reviewCiKeys.filter((key) => !value(key));
	if (missing.length > 0) return { config: null, missing };
	return {
		config: {
			provider: value("ASSIST_REVIEW_PROVIDER"),
			baseUrl: value("ASSIST_REVIEW_BASE_URL").replace(/\/+$/, ""),
			claudeModel: value("ASSIST_REVIEW_CLAUDE_MODEL"),
			codexModel: value("ASSIST_REVIEW_CODEX_MODEL"),
			apiKey: value(reviewCiSecret),
		},
		missing,
	};
}
