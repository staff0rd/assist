import type { Command } from "commander";
import { configHelp } from "../../../shared/configHelp";
import { linkNode } from "./linkNode";
import { listNodes } from "./listNodes";
import { nodesConfigHelp } from "./nodesConfigHelp";
import { unlinkNode } from "./unlinkNode";

export function registerNodes(sessions: Command): void {
	const cmd = sessions
		.command("nodes")
		.description("List this node and every linked node with its link state")
		.option("--json", "Output as JSON")
		.action(listNodes);

	cmd
		.command("link <name> <url>")
		.description(
			"Link a peer node by its web server URL (name must match the peer's sessions.nodeName)",
		)
		.action(linkNode);

	cmd
		.command("unlink <name>")
		.description("Remove a linked node")
		.action(unlinkNode);

	configHelp(cmd, nodesConfigHelp);
}
