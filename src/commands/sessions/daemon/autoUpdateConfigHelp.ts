import type { ConfigHelpEntry } from "../../../shared/configHelp";

export const autoUpdateConfigHelp: ConfigHelpEntry[] = [
	{
		key: "autoUpdate.enabled",
		setter: "assist config set autoUpdate.enabled false -g",
		note: "when this install is a git clone, the daemon pulls and builds it in the background as origin moves (assist watch wait --pull --build), logging each lap to ~/.assist/watchers/; a branch that cannot fast-forward starts a claude session to reconcile it and the loop resumes once it closes. Set false to stop it (default on)",
	},
];
