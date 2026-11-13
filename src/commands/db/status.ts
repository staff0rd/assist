import { getMigrationStatus } from "../../shared/db/migrations/getMigrationStatus";
import { findRetiredTables } from "../../shared/db/retired/findRetiredTables";
import { reportRetiredTables } from "./reportRetiredTables";
import { reportMigrationStatus } from "./reportMigrationStatus";
import { withPool } from "./withPool";

export async function status(): Promise<void> {
	await withPool(async (exec) => {
		reportMigrationStatus(await getMigrationStatus(exec));
		reportRetiredTables(await findRetiredTables(exec));
	});
}
