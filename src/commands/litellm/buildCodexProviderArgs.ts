export type CodexModelOverride = {
	args: string[];
	env: Record<string, string>;
	model?: string;
};

const API_KEY_ENV = "ASSIST_LITELLM_API_KEY";

export function buildCodexProviderArgs(
	responsesBaseUrl: string,
	apiKey: string,
	model: string,
): CodexModelOverride {
	return {
		args: [
			"-c",
			"model_providers.litellm.name=LiteLLM",
			"-c",
			`model_providers.litellm.base_url=${responsesBaseUrl}`,
			"-c",
			`model_providers.litellm.env_key=${API_KEY_ENV}`,
			"-c",
			"model_providers.litellm.wire_api=responses",
			"-c",
			"model_provider=litellm",
			"-m",
			model,
		],
		env: { [API_KEY_ENV]: apiKey },
		model,
	};
}
