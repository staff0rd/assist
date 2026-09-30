import { reviewCiProviders } from "./reviewCiVariables";

export type ReviewCiEndpoints = {
	anthropic: string;
	responses: string;
	anthropicKind: "gateway" | "foundry";
};

export function deriveEndpoints(
	provider: string,
	baseUrl: string,
): ReviewCiEndpoints {
	if (provider === "litellm")
		return {
			anthropic: baseUrl,
			responses: `${baseUrl}/v1`,
			anthropicKind: "gateway",
		};
	if (provider === "foundry")
		return {
			anthropic: `${baseUrl}/anthropic`,
			responses: `${baseUrl}/openai/v1`,
			anthropicKind: "foundry",
		};
	throw new Error(
		`Unsupported ASSIST_REVIEW_PROVIDER "${provider}" (expected one of: ${reviewCiProviders.join(", ")})`,
	);
}
