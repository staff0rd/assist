import type { ConfigHelpEntry } from "../../shared/configHelp";

export const prsRaiseConfigHelp: ConfigHelpEntry[] = [
	{
		key: "prs.promptJira",
		setter: "assist config set prs.promptJira true",
		note: "'assist prs raise' help asks the user for a Jira key to --resolves (default false)",
	},
	{
		key: "prs.promptGithub",
		setter: "assist config set prs.promptGithub true",
		note: "'assist prs raise' help asks the user for a GitHub issue to --resolves (default false)",
	},
	{
		key: "prs.draft",
		setter: "assist config set prs.draft true",
		note: "'assist prs raise' creates a draft PR when neither --draft nor --no-draft is passed (default false)",
	},
	{
		key: "prs.reviewAfterRaise",
		setter: "assist config set prs.reviewAfterRaise false",
		note: "the PR preview pane's Review PR toggle starts checked (default true)",
	},
];

export const prsConfigHelp: ConfigHelpEntry[] = [
	{
		key: "prs.slack",
		setter: 'assist config set prs.slack "#pull-requests"',
		note: "Slack channel PRs are announced to, falling back to slack.channel (read by 'assist prs slack-channel', used by /prs-slack)",
	},
	{
		key: "prs.required",
		setter: "assist config set prs.required false",
		note: "require a branch when running a backlog item (default true; set false to opt out)",
	},
	...prsRaiseConfigHelp,
];
