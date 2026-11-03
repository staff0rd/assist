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
		key: "devlog.skipWeeks",
		setter: "assist devlog skip 2026-W33",
		note: "ISO weeks (YYYY-Www) that get no dev entry; skip writes repo (db)",
	},
];
