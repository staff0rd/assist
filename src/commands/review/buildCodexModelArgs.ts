import { loadConfig } from "../../shared/loadConfig";
import { readLitellmConfig } from "../litellm/readLitellmConfig";

const API_KEY_ENV = "ASSIST_LITELLM_API_KEY";

type CodexModelOverride = {
	args: string[];
	env: Record<string, string>;
};

export function buildCodexModelArgs(): CodexModelOverride {
	const model = loadConfig().review?.codexModel?.trim();
	if (!model) return { args: [], env: {} };
	const { config } = readLitellmConfig();
	if (!config) return { args: [], env: {} };
	return {
		args: [
			"-c",
			`model_providers.litellm.base_url=${config.baseUrl}/v1`,
			"-c",
			`model_providers.litellm.env_key=${API_KEY_ENV}`,
			"-c",
			"model_providers.litellm.wire_api=chat",
			"-c",
			"model_provider=litellm",
			"-m",
			model,
		],
		env: { [API_KEY_ENV]: config.apiKey },
	};
}
