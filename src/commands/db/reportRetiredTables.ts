import chalk from "chalk";
import type { RetiredTable } from "../../shared/db/retired/findRetiredTables";

export function reportRetiredTables(tables: RetiredTable[]): void {
	for (const table of tables) {
		console.error(
			chalk.yellow(
				`Retired table ${table.name} still exists (${table.rows} rows). Run \`assist db drop-retired\` to drop it.`,
			),
		);
	}
}
