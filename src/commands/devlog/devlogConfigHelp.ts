import type { ConfigHelpEntry } from "../../shared/configHelp";

export const devlogConfigHelp: ConfigHelpEntry[] = [
	{
		key: "devlog.dir",
		setter: "assist config set devlog.dir ~/git/blog/src/content/dev",
		note: "folder holding <repo>/<yyyy>-wNN.md dev entries",
	},
	{
		key: "devlog.name",
		setter: "assist config set devlog.name my-repo",
		note: "override the project name weekly dev entries are filed under",
	},
	{
		key: "devlog.ignore",
		setter: 'assist config set devlog.ignore "**/*.lock"',
		note: "globs excluded when grouping commits",
	},
	{
		key: "devlog.slack",
		setter: 'assist config set devlog.slack "#devlog"',
		note: "Slack channel dev entries are posted to, falling back to slack.channel (used by 'assist devlog slack' and /devlog --slack-post)",
	},
	{
		key: "devlog.url",
		setter: "assist config set devlog.url https://example.com/dev",
		note: "base URL of the published dev entries; when set, Slack posts end with a link to <url>/<project>/<yyyy>-wNN",
	},
	{
		key: "devlog.skipWeeks",
		setter: "assist devlog skip 2026-W33",
		note: "ISO weeks (YYYY-Www) that get no dev entry; skip writes repo (db)",
	},
];
