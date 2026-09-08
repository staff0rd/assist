import type { ConfigHelpEntry } from "../../shared/configHelp";

export const litellmConfigHelp: ConfigHelpEntry[] = [
	{
		key: "litellm.baseUrl",
		setter: "assist config set litellm.baseUrl https://...",
		note: "LiteLLM proxy base URL",
	},
	{
		key: "litellm.apiKey",
		setter: "assist config set litellm.apiKey sk-...",
		note: "LiteLLM proxy API key",
	},
];
