import { applyMigrations } from "../../shared/db/migrations/applyMigrations";
import { findRetiredTables } from "../../shared/db/retired/findRetiredTables";
import { refuseLockedMigrate } from "./refuseLockedMigrate";
import { refuseUnreleasedMigrations } from "./refuseUnreleasedMigrations";
import { reportRetiredTables } from "./reportRetiredTables";
import { reportApplied } from "./reportMigrationStatus";
import { withPool } from "./withPool";

export async function migrate(
	options: { afterUpdate?: boolean } = {},
): Promise<void> {
	// Update applies released migrations, which this session did not author.
	if (!options.afterUpdate) await refuseLockedMigrate();
	await withPool(async (exec) => {
		await refuseUnreleasedMigrations(exec);
		reportApplied(await applyMigrations(exec));
		reportRetiredTables(await findRetiredTables(exec));
	});
}
