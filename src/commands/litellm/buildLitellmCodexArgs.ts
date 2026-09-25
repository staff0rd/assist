import { readLitellmConfig } from "./readLitellmConfig";

const API_KEY_ENV = "ASSIST_LITELLM_API_KEY";

export type CodexModelOverride = {
	args: string[];
	env: Record<string, string>;
	model?: string;
};

export function buildLitellmCodexArgs(
	rawModel: string | undefined,
): CodexModelOverride {
	const model = rawModel?.trim();
	if (!model) return { args: [], env: {} };
	const { config } = readLitellmConfig();
	if (!config) return { args: [], env: {} };
	return {
		args: [
			"-c",
			"model_providers.litellm.name=LiteLLM",
			"-c",
			`model_providers.litellm.base_url=${config.baseUrl}/v1`,
			"-c",
			`model_providers.litellm.env_key=${API_KEY_ENV}`,
			"-c",
			"model_providers.litellm.wire_api=responses",
			"-c",
			"model_provider=litellm",
			"-m",
			model,
		],
		env: { [API_KEY_ENV]: config.apiKey },
		model,
	};
}
