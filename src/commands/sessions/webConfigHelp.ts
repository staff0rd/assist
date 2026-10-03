import type { ConfigHelpEntry } from "../../shared/configHelp";

export const webConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.tailscaleServe",
		setter: "assist config set sessions.tailscaleServe false -g",
		note: "default on: the web server exposes its port on the tailnet with tailscale serve when it starts, so other nodes can link it by Tailscale name; set false to keep it off the tailnet",
	},
];
