import type { ConfigHelpEntry } from "../../shared/configHelp";

export const prsRaiseConfigHelp: ConfigHelpEntry[] = [
	{
		key: "prs.promptJira",
		setter: "assist config set prs.promptJira true",
		note: "'assist prs raise' help asks the user for a Jira key to --resolves (default false)",
	},
	{
		key: "prs.draft",
		setter: "assist config set prs.draft true",
		note: "'assist prs raise' creates a draft PR when neither --draft nor --no-draft is passed (default false)",
	},
];

export const prsReadTimeConfigHelp: ConfigHelpEntry[] = [
	{
		key: "prs.readingWordsPerMinute",
		setter: "assist config set prs.readingWordsPerMinute 250",
		note: "nominal prose reading speed 'assist prs read-time' estimates with (default 200); the effective rate decays with length, so a 500-word description reads at ~70 wpm, and fenced code counts double",
	},
];

export const prsConfigHelp: ConfigHelpEntry[] = [
	{
		key: "prs.slack",
		setter: 'assist config set prs.slack "#pull-requests"',
		note: "Slack channel PRs are announced to (used by /prs-slack)",
	},
	{
		key: "prs.required",
		setter: "assist config set prs.required true",
		note: "require a branch when running a backlog item",
	},
	...prsRaiseConfigHelp,
	...prsReadTimeConfigHelp,
];
