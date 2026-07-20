import type { Command } from "commander";
import { dbMigrationConfirm } from "./dbMigration/dbMigrationConfirm";
import { dbMigrationUnlock } from "./dbMigration/dbMigrationUnlock";

export function registerDbMigration(parent: Command): void {
	const dbMigration = parent
		.command("db-migration")
		.description(
			"Human-in-the-loop approval gate for creating a new database migration",
		);

	dbMigration
		.command("unlock")
		.description(
			"Page a human by issuing a pin authorising the next new migration module",
		)
		.action(dbMigrationUnlock);

	dbMigration
		.command("confirm")
		.description(
			"Confirm a pin from 'db-migration unlock' to record a one-shot approval scoped to that migration id",
		)
		.argument("<pin>", "Pin issued by 'db-migration unlock'")
		.action(dbMigrationConfirm);
}
