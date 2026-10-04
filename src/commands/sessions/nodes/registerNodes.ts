import type { Command } from "commander";
import { configHelp } from "../../../shared/configHelp";
import { doctorNodes } from "./doctorNodes";
import { listNodes } from "./listNodes";
import { nodeLogs } from "./nodeLogs";
import { nodesConfigHelp } from "./nodesConfigHelp";
import { registerLinkCommand } from "./registerLinkCommand";
import { restartNode } from "./restartNode";
import { unlinkNode } from "./unlinkNode";
import { updateNode } from "./updateNode";

export function registerNodes(sessions: Command): void {
	const cmd = sessions
		.command("nodes")
		.description("List this node and every linked node with its link state")
		.option("--json", "Output as JSON")
		.action(listNodes);

	registerLinkCommand(cmd);

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

	cmd
		.command("restart <name>")
		.description(
			"Restart a linked node's daemon and/or web server, wait for its link to reconnect and print its version",
		)
		.option("--target <target>", "daemon, webserver or both", "both")
		.action(restartNode);

	cmd
		.command("update <name>")
		.description(
			"Run assist update on a linked node, restart it, wait for its link to reconnect and print its version",
		)
		.action((name: string) => updateNode(name));

	configHelp(cmd, nodesConfigHelp);
}
