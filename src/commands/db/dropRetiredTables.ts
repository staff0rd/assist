import { findRetiredTables } from "../../shared/db/retired/findRetiredTables";
import type { MigrationExecutor } from "../../shared/db/migrations/MigrationExecutor";
import { promptConfirm } from "../../shared/promptConfirm";

export async function dropRetiredTables(
	exec: MigrationExecutor,
): Promise<void> {
	const tables = await findRetiredTables(exec);
	if (tables.length === 0) {
		console.log("No retired tables to drop.");
		return;
	}
	for (const table of tables) {
		const confirmed = await promptConfirm(
			`Drop retired table ${table.name} (${table.rows} rows)?`,
			false,
		);
		if (!confirmed) {
			console.log(`Kept ${table.name}.`);
			continue;
		}
		await exec.exec(`DROP TABLE "${table.name}"`);
		console.log(`Dropped ${table.name}.`);
	}
}
