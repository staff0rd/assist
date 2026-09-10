import type { ConfigHelpEntry } from "../../shared/configHelp";

export const readTimeConfigHelp: ConfigHelpEntry[] = [
	{
		key: "readTime.wordsPerMinute",
		setter: "assist config set readTime.wordsPerMinute 250",
		note: "nominal prose reading speed 'assist read-time' estimates with (default 200); the effective rate decays with length, so a 500-word document reads at ~70 wpm, and fenced code counts double",
	},
	{
		key: "prs.readingWordsPerMinute",
		setter: "assist config set prs.readingWordsPerMinute 250",
		note: "same speed under the command's former name, read only when readTime.wordsPerMinute is unset",
	},
];
