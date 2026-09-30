import type { ReviewCiEndpoints } from "./deriveEndpoints";
import { probeEndpoint } from "./probeEndpoint";
import type { ReviewCiConfig } from "./readReviewCiEnv";

export async function probeModels(
	config: ReviewCiConfig,
	endpoints: ReviewCiEndpoints,
): Promise<string[]> {
	const auth = { Authorization: `Bearer ${config.apiKey}` };
	const messagesUrl = `${endpoints.anthropic}/v1/messages`;
	const responsesUrl = `${endpoints.responses}/responses`;

	const [claudeError, codexError] = await Promise.all([
		probeEndpoint(
			messagesUrl,
			{
				...(endpoints.anthropicKind === "gateway" ? auth : {}),
				"x-api-key": config.apiKey,
				"anthropic-version": "2023-06-01",
			},
			{
				model: config.claudeModel,
				max_tokens: 1,
				messages: [{ role: "user", content: "ping" }],
			},
		),
		probeEndpoint(responsesUrl, auth, {
			model: config.codexModel,
			input: "ping",
			max_output_tokens: 16,
		}),
	]);

	return [
		...(claudeError
			? [
					`Claude model "${config.claudeModel}" at ${messagesUrl}: ${claudeError}`,
				]
			: []),
		...(codexError
			? [`Codex model "${config.codexModel}" at ${responsesUrl}: ${codexError}`]
			: []),
	];
}
