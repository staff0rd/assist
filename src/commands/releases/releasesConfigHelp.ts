import type { ConfigHelpEntry } from "../../shared/configHelp";

export const releasesConfigHelp: ConfigHelpEntry[] = [
	{
		key: "releases.streams",
		setter: "assist releases configure <owner/repo>",
		note: "promotion streams the /releases page draws; each names a repo, its release workflow, its nodes and the edges between them",
	},
];
