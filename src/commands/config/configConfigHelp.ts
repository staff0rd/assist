import type { ConfigHelpEntry } from "../../shared/configHelp";

export const configConfigHelp: ConfigHelpEntry[] = [
	{
		key: "repos",
		setter: "assist config set worktree.enabled true --repo",
		note: "repo (db): per-repo overrides stored in the shared db, keyed by repo identity and seen by every node that uses it; written by 'config set --repo [name]' or the web /config repo (db) scope, and a yml repos: entry applies only until 'config import-repos' moves it",
	},
];
