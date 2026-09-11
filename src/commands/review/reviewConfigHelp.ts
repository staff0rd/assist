import type { ConfigHelpEntry } from "../../shared/configHelp";

export const reviewConfigHelp: ConfigHelpEntry[] = [
	{
		key: "review.codexModel",
		setter: "assist config set review.codexModel gpt-5-codex",
		note: "optional; runs the codex reviewer on this model via the LiteLLM proxy (needs litellm.baseUrl and litellm.apiKey)",
	},
];
