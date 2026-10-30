import type { ConfigHelpEntry } from "../../shared/configHelp";

export const backlogConfigHelp: ConfigHelpEntry[] = [
	{
		key: "database.url",
		setter: "assist config set database.url postgresql://...",
		note: "Postgres connection string for backlog storage (or ASSIST_DATABASE_URL)",
	},
	{
		key: "clone.baseDir",
		setter: "assist config set clone.baseDir ~/git",
		note: "base directory 'backlog clone' clones repos into (default: ~/git)",
	},
	{
		key: "docs.refreshAfter",
		setter: "assist config set docs.refreshAfter 5",
		note: "queue a 'Refresh docs' item once this many done stories are unswept (unset: off)",
	},
];
