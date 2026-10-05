import type { ConfigHelpEntry } from "../../shared/configHelp";

export const configConfigHelp: ConfigHelpEntry[] = [
	{
		key: "repos",
		setter: "assist config set worktree.enabled true -g --repo",
		note: "per-repo overrides stored in the shared db, keyed by repo identity and seen by every node that uses it; written by 'config set -g --repo [name]' or the web /config repo scope, and a yml repos: entry applies only until 'config import-repos' moves it",
	},
];
