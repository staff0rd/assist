import type { Command } from "commander";
import { linkNode } from "./linkNode";

export function registerLinkCommand(nodes: Command): void {
	nodes
		.command("link <name> [url]")
		.description(
			"Link a peer node by its web server URL, by its Tailscale name with --tailscale and --port, or over ssh with --ssh and --port (name must match the peer's sessions.nodeName)",
		)
		.option(
			"--tailscale <host>",
			"Dial the peer at https://<host>.<tailnet>.ts.net:<port> (the peer runs tailscale serve for its web server port)",
		)
		.option(
			"--ssh <alias>",
			"Tunnel to the peer through this ~/.ssh/config alias",
		)
		.option(
			"--port <port>",
			"The peer's web server port (with --tailscale or --ssh)",
		)
		.option(
			"--local-port <port>",
			"Local end of the ssh tunnel (default: 43000 + port % 1000, bumped past other links)",
		)
		.action(linkNode);
}
