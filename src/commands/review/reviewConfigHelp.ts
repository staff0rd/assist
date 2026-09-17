import type { ConfigHelpEntry } from "../../shared/configHelp";

export const reviewConfigHelp: ConfigHelpEntry[] = [
	{
		key: "review.codexModel",
		setter: "assist config set review.codexModel gpt-5-codex",
		note: "optional; runs the codex reviewer on this model via the LiteLLM proxy (needs litellm.baseUrl and litellm.apiKey)",
	},
	{
		key: "review.highLevel.criticalPaths",
		setter:
			'assist config set review.highLevel.criticalPaths "**/*.graphql,en-AU/translation.json"',
		note: "comma-separated globs whose full diffs the high-level review shows; unset shows none",
	},
	{
		key: "review.highLevel.uiPaths",
		setter: 'assist config set review.highLevel.uiPaths "src/ui/**"',
		note: "comma-separated globs that make a change a UI change, so --high-level requires a screenshot or video; unset requires none",
	},
	{
		key: "review.highLevel.descriptionWordCap",
		setter: "assist config set review.highLevel.descriptionWordCap 300",
		note: "word cap --high-level holds the PR description to (default 300)",
	},
];
