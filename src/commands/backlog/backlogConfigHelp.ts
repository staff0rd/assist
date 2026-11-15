import type { ConfigHelpEntry } from "../../shared/configHelp";

export const backlogConfigHelp: ConfigHelpEntry[] = [
	{
		key: "database.url",
		setter: "assist config set database.url postgresql://...",
		note: "Postgres connection string for backlog storage (or ASSIST_DATABASE_URL)",
	},
	{
		key: "backlog.maxParallelPhases",
		setter: "assist config set backlog.maxParallelPhases 3",
		note: "how many independent phases 'backlog run' runs at once, each in its own worktree (default: 3; 1 runs phases one at a time)",
	},
	{
		key: "clone.baseDir",
		setter: "assist config set clone.baseDir ~/git",
		note: "base directory 'backlog clone' clones repos into (default: ~/git)",
	},
	{
		key: "docs.refreshAfter",
		setter: "assist config set docs.refreshAfter 5",
		note: "queue a 'Refresh docs' item once this many done stories are unswept (unset: Refresh docs is off — no button, no refresh-docs, no docs locking)",
	},
];
