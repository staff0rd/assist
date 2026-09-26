import type { ConfigHelpEntry } from "../../shared/configHelp";

export const newsConfigHelp: ConfigHelpEntry[] = [
	{
		key: "news.showInNav",
		setter: "assist config set news.showInNav true",
		note: "show the News tab in the web UI top nav (default false); /news stays reachable by URL either way",
	},
];
