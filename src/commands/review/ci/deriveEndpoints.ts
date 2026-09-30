import { reviewCiProviders } from "./reviewCiVariables";

export type ReviewCiEndpoints = { anthropic: string; responses: string };

export function deriveEndpoints(
	provider: string,
	baseUrl: string,
): ReviewCiEndpoints {
	if (provider === "litellm")
		return { anthropic: baseUrl, responses: `${baseUrl}/v1` };
	throw new Error(
		`Unsupported ASSIST_REVIEW_PROVIDER "${provider}" (expected one of: ${reviewCiProviders.join(", ")})`,
	);
}
