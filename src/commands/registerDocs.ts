import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { docsConfirm } from "./docs/docsConfirm";
import { docsUnlock } from "./docs/docsUnlock";

const calledBy = "agents whose docs edit the docs lock blocked";

export function registerDocs(parent: Command): void {
	const docs = parent
		.command("docs")
		.description(
			"Human-in-the-loop approval to unlock docs pages and screenshots for a backlog item",
		);

	internalCommand(
		docs
			.command("unlock")
			.description(
				"Page a human with a pin to unlock docs changes for this session's backlog item",
			)
			.action(docsUnlock),
		calledBy,
	);

	internalCommand(
		docs
			.command("confirm")
			.description(
				"Confirm a pin from 'docs unlock' to approve docs changes for that backlog item",
			)
			.argument("<pin>", "Pin issued by 'docs unlock'")
			.action(docsConfirm),
		calledBy,
	);
}
