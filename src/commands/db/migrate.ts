import { applyMigrations } from "../../shared/db/migrations/applyMigrations";
import { findRetiredTables } from "../../shared/db/retired/findRetiredTables";
import { isDatabaseConfigured } from "./isDatabaseConfigured";
import { refuseLockedMigrate } from "./refuseLockedMigrate";
import { refuseUnreleasedMigrations } from "./refuseUnreleasedMigrations";
import { reportRetiredTables } from "./reportRetiredTables";
import { reportApplied } from "./reportMigrationStatus";
import { withPool } from "./withPool";

export async function migrate(
	options: { afterUpdate?: boolean } = {},
): Promise<void> {
	if (options.afterUpdate) {
		if (!isDatabaseConfigured()) {
			console.log("No database configured; skipping migrations.");
			return;
		}
		console.log("Applying released migrations...");
	} else {
		// Update applies released migrations, which this session did not author.
		await refuseLockedMigrate();
	}
	await withPool(async (exec) => {
		await refuseUnreleasedMigrations(exec);
		reportApplied(await applyMigrations(exec));
		reportRetiredTables(await findRetiredTables(exec));
	});
}
