import type { ConfigHelpEntry } from "../../../shared/configHelp";

export const nodesConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.links",
		setter:
			"assist sessions nodes link <name> --tailscale <host> --port <port> (or a peer <url>)",
		note: "linked nodes whose sessions merge into this node's web UI, each dialled at its url (a Tailscale https://<host>.<tailnet>.ts.net:<port> url, or any direct url); each name must match the peer's sessions.nodeName",
	},
	{
		key: "sessions.linkVersionCheck",
		setter: "assist config set sessions.linkVersionCheck block -g",
		note: "reaction when a linked node's protocol range doesn't overlap this node's (app versions may differ; never restarts a peer): block (default) holds the link version-blocked until the older node is updated, warn proceeds, off skips the check",
	},
];
