import type { ConfigHelpEntry } from "../../shared/configHelp";

export const webConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.tailscaleServe",
		setter: "assist config set sessions.tailscaleServe false --node",
		note: "default on: the web server exposes its port on the tailnet with tailscale serve when it starts, so other nodes can link it by Tailscale name; set false to keep it off the tailnet",
	},
	{
		key: "extension.redirects",
		setter:
			"assist config set extension.redirects.<owner>/<repo> <owner>/<repo> --node",
		note: "maps a GitHub owner/repo to the owner/repo whose clone under clone.baseDir hosts the browser extension's issue sessions; the prompt keeps the original link, and PR review sends are not redirected",
	},
];
