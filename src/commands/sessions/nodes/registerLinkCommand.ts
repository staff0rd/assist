import type { Command } from "commander";
import { linkNode } from "./linkNode";

export function registerLinkCommand(nodes: Command): void {
	nodes
		.command("link <name> [url]")
		.description(
			"Link a peer node by its web server URL or by its Tailscale name with --tailscale and --port (name must match the peer's sessions.nodeName)",
		)
		.option(
			"--tailscale <host>",
			"Dial the peer at https://<host>.<tailnet>.ts.net:<port> (the peer runs tailscale serve for its web server port)",
		)
		.option("--port <port>", "The peer's web server port (with --tailscale)")
		.action(linkNode);
}
