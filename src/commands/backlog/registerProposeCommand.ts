import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { proposeHelpText } from "./propose/proposeHelpText";
import { lazyAction } from "../../shared/lazyAction";

export function registerProposeCommand(cmd: Command): void {
	internalCommand(
		cmd
			.command("propose")
			.description(
				"Preview a complete backlog item for approval, then create it on approval",
			)
			.requiredOption(
				"--json <file|->",
				"Path to a JSON payload describing the item, or - to read it from stdin",
			)
			.option(
				"--confirmed",
				"Create the item after its draft has been reviewed in chat (agent use outside a web session)",
			)
			.addHelpText("after", `\n${proposeHelpText}`)
			.action(lazyAction(() => import("./propose"), "propose")),
		"/draft and /bug",
	);
}
