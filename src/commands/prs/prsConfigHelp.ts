import type { ConfigHelpEntry } from "../../shared/configHelp";

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
];
