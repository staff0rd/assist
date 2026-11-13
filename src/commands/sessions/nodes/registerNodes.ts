import type { Command } from "commander";
import { configHelp } from "../../../shared/configHelp";
import { internalCommand } from "../../../shared/internalCommand";
import { nodesConfigHelp } from "./nodesConfigHelp";
import { registerDiagnoseCommands } from "./registerDiagnoseCommands";
import { registerLinkCommand } from "./registerLinkCommand";
import { registerPeerActionCommands } from "./registerPeerActionCommands";
import { lazyAction } from "../../../shared/lazyAction";
const calledBy = "agents managing linked nodes";

export function registerNodes(sessions: Command): void {
	const cmd = internalCommand(
		sessions
			.command("nodes")
			.description("List this node and every linked node with its link state")
			.option("--json", "Output as JSON")
			.action(lazyAction(() => import("./listNodes"), "listNodes")),
		calledBy,
	);

	internalCommand(registerLinkCommand(cmd), calledBy);

	internalCommand(
		cmd
			.command("unlink <name>")
			.description("Remove a linked node")
			.action(lazyAction(() => import("./unlinkNode"), "unlinkNode")),
		calledBy,
	);

	registerDiagnoseCommands(cmd, calledBy);
	registerPeerActionCommands(cmd, calledBy);

	configHelp(cmd, nodesConfigHelp);
}
