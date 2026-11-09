import type { ConfigHelpEntry } from "../../../shared/configHelp";

export const autoUpdateConfigHelp: ConfigHelpEntry[] = [
	{
		key: "autoUpdate.enabled",
		setter: "assist config set autoUpdate.enabled false --node",
		note: "when this install is a git clone, the daemon pulls and builds it in the background as origin moves (assist watch wait --pull --build), logging each lap to ~/.assist/watchers/; a branch that cannot fast-forward starts a claude session to reconcile it and the loop resumes once it closes. Set false to stop it (default on)",
	},
	{
		key: "autoUpdate.restart",
		setter: "assist config set autoUpdate.restart true --node",
		note: "the node's web server applies a ready update itself, restarting the daemon and/or web server once every live agent session has been awaiting the user for a minute (or there are none); skipped while the build is pending, the loop is diverged or paused, and attempted once per built version. Toggle it per node from the Updates page (default off)",
	},
	{
		key: "autoUpdate.idleMinutes",
		setter: "assist config set autoUpdate.idleMinutes 5 --node",
		note: "with autoUpdate.restart on, hold the auto-restart until the web UI has seen no pointer, keyboard, wheel or touch input for this many minutes (default 2)",
	},
];
