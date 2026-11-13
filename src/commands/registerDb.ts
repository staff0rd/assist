import type { Command } from "commander";
import { latestMigrationId } from "../shared/db/migrations";
import { lazyAction } from "../shared/lazyAction";

export function registerDb(program: Command): void {
	const db = program
		.command("db")
		.description("Inspect and apply the backlog database migrations");

	db.command("migrate")
		.description(
			`Apply pending migrations in order (build ships up to migration ${latestMigrationId})`,
		)
		.action(lazyAction(() => import("./db/migrate"), "migrate"));

	db.command("status")
		.description(
			"Report whether the database is in sync, behind, or ahead of this build",
		)
		.action(lazyAction(() => import("./db/status"), "status"));

	db.command("drop-retired")
		.description(
			"Drop retired tables left by removed features, after confirming each",
		)
		.action(async () => {
			const { withPool } = await import("./db/withPool");
			const { dropRetiredTables } = await import("./db/dropRetiredTables");
			return withPool(dropRetiredTables);
		});
}
