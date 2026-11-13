import { applyMigrations } from "../../shared/db/migrations/applyMigrations";
import { findRetiredTables } from "../../shared/db/retired/findRetiredTables";
import { reportRetiredTables } from "./reportRetiredTables";
import { reportApplied } from "./reportMigrationStatus";
import { withPool } from "./withPool";

export async function migrate(): Promise<void> {
	await withPool(async (exec) => {
		reportApplied(await applyMigrations(exec));
		reportRetiredTables(await findRetiredTables(exec));
	});
}
