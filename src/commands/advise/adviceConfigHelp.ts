import type { ConfigHelpEntry } from "../../shared/configHelp";

export const adviceConfigHelp: ConfigHelpEntry[] = [
	{
		key: "advice.include",
		setter: 'assist config set advice.include "refactor"',
		note: "fragment names included whatever their condition says; 'assist advise --explain' lists every name",
	},
	{
		key: "advice.exclude",
		setter: 'assist config set advice.exclude "jira-context"',
		note: "fragment names dropped even when their condition matches; 'assist advise --explain' lists every name",
	},
	{
		key: "advice.extra",
		setter: 'assist config set advice.extra "Deploy from main only"',
		note: 'free text appended as a "Repo notes" section',
	},
	{
		key: "advice.verify",
		setter: 'assist config set advice.verify "Run make check"',
		note: "replaces the verify fragment's text and forces it in",
	},
];
