import { printTable } from "./printTable";
import { resolveConnection } from "./resolveConnection";
import { sqlConnect } from "./sqlConnect";

export async function sqlTables(connectionName?: string): Promise<void> {
	const conn = resolveConnection(connectionName);
	const pool = await sqlConnect(conn);
	try {
		const result = await pool.request().query(
			`SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
			FROM INFORMATION_SCHEMA.TABLES
			ORDER BY TABLE_SCHEMA, TABLE_NAME`,
		);
		const rows = (result.recordset ?? []) as Record<string, unknown>[];
		printTable(rows);
	} finally {
		await pool.close();
	}
}
