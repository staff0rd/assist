import type { Command } from "commander";
import { configHelp } from "../../../shared/configHelp";
import { doctorNodes } from "./doctorNodes";
import { linkNode } from "./linkNode";
import { listNodes } from "./listNodes";
import { nodeLogs } from "./nodeLogs";
import { nodesConfigHelp } from "./nodesConfigHelp";
import { unlinkNode } from "./unlinkNode";

export function registerNodes(sessions: Command): void {
	const cmd = sessions
		.command("nodes")
		.description("List this node and every linked node with its link state")
		.option("--json", "Output as JSON")
		.action(listNodes);

	cmd
		.command("link <name> [url]")
		.description(
			"Link a peer node by its web server URL, or over ssh with --ssh and --port (name must match the peer's sessions.nodeName)",
		)
		.option(
			"--ssh <alias>",
			"Tunnel to the peer through this ~/.ssh/config alias",
		)
		.option("--port <port>", "The peer's loopback web server port (with --ssh)")
		.option(
			"--local-port <port>",
			"Local end of the ssh tunnel (default: 43000 + port % 1000, bumped past other links)",
		)
		.action(linkNode);

	cmd
		.command("unlink <name>")
		.description("Remove a linked node")
		.action(unlinkNode);

	cmd
		.command("doctor [name]")
		.description(
			"Probe each hop of every link (or one) in order and stop at the first failure with a remediation",
		)
		.option("--json", "Output as JSON")
		.action((name: string | undefined, _options, command: Command) =>
			doctorNodes(name, command.optsWithGlobals()),
		);

	cmd
		.command("logs <name>")
		.description("Tail a linked node's daemon.log through its web server")
		.option("-n, --lines <lines>", "Number of lines", "200")
		.option("--json", "Output as JSON")
		.action((name: string, _options, command: Command) =>
			nodeLogs(name, command.optsWithGlobals()),
		);

	configHelp(cmd, nodesConfigHelp);
}
