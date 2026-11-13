import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { lazyAction } from "../shared/lazyAction";
const calledBy = "agents whose docs edit the docs lock blocked";

export function registerDocs(parent: Command): void {
	const docs = parent
		.command("docs")
		.description(
			"Human-in-the-loop approval to unlock docs pages and screenshots for a backlog item phase",
		);

	internalCommand(
		docs
			.command("unlock")
			.description(
				"Page a human with a pin to unlock docs changes for this session's backlog item phase",
			)
			.action(lazyAction(() => import("./docs/docsUnlock"), "docsUnlock")),
		calledBy,
	);

	internalCommand(
		docs
			.command("confirm")
			.description(
				"Confirm a pin from 'docs unlock' to approve docs changes for that backlog item phase",
			)
			.argument("<pin>", "Pin issued by 'docs unlock'")
			.action(lazyAction(() => import("./docs/docsConfirm"), "docsConfirm")),
		calledBy,
	);
}
