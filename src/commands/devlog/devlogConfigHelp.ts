import type { ConfigHelpEntry } from "../../shared/configHelp";

export const devlogConfigHelp: ConfigHelpEntry[] = [
	{
		key: "devlog.name",
		setter: "assist config set devlog.name my-repo",
		note: "override the repo name reported in devlog entries",
	},
	{
		key: "devlog.ignore",
		setter: 'assist config set devlog.ignore "**/*.lock"',
		note: "globs excluded when grouping commits",
	},
	{
		key: "devlog.skip",
		setter: "assist devlog skip 2026-07-10",
		note: "dates (per repo) omitted from devlog output",
	},
];
