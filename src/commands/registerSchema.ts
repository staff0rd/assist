import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { schemaConfirm } from "./schema/schemaConfirm";
import { schemaUnlock } from "./schema/schemaUnlock";

const calledBy = "agents whose database schema change the schema lock blocked";

export function registerSchema(parent: Command): void {
	const schema = parent
		.command("schema")
		.description(
			"Human-in-the-loop approval to unlock database schema files for a backlog item phase or Claude session",
		);

	internalCommand(
		schema
			.command("unlock")
			.description(
				"Page a human with a pin to unlock schema changes for this session's backlog item phase, or this Claude session when there is no item",
			)
			.action(schemaUnlock),
		calledBy,
	);

	internalCommand(
		schema
			.command("confirm")
			.description(
				"Confirm a pin from 'schema unlock' to approve schema changes for that item phase or Claude session",
			)
			.argument("<pin>", "Pin issued by 'schema unlock'")
			.action(schemaConfirm),
		calledBy,
	);
}
