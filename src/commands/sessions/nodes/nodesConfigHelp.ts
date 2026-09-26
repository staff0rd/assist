import type { ConfigHelpEntry } from "../../../shared/configHelp";

export const nodesConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.links",
		setter: "assist sessions nodes link pc-windows http://127.0.0.1:3101",
		note: "linked nodes whose sessions merge into this node's web UI; each name must match the peer's sessions.nodeName",
	},
	{
		key: "sessions.linkVersionCheck",
		setter: "assist config set sessions.linkVersionCheck block -g",
		note: "reaction to a version mismatch with a linked node: block (default) heals an older peer via its /api/self-update and latches if the gap remains, warn proceeds, off skips the check",
	},
];
