import chalk from "chalk";
import { isMutation } from "./isMutation";
import { printTable } from "./printTable";
import { resolveConnection } from "./resolveConnection";
import { sqlConnect } from "./sqlConnect";

export async function sqlQuery(
	query: string,
	connectionName?: string,
): Promise<void> {
	if (isMutation(query)) {
		console.error(
			chalk.red(
				"assist sql query refuses mutating statements. Use `assist sql mutate` instead.",
			),
		);
		process.exit(1);
	}
	const conn = resolveConnection(connectionName);
	const pool = await sqlConnect(conn);
	try {
		const result = await pool.request().query(query);
		const rows = (result.recordset ?? []) as Record<string, unknown>[];
		if (result.recordset) {
			printTable(rows);
		} else {
			console.log(
				chalk.dim(`${result.rowsAffected.join(", ")} row(s) affected`),
			);
		}
	} finally {
		await pool.close();
	}
}
