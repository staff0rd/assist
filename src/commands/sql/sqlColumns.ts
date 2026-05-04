import { printTable } from "./printTable";
import { resolveConnection } from "./resolveConnection";
import { sqlConnect } from "./sqlConnect";

export async function sqlColumns(
	table: string,
	connectionName?: string,
): Promise<void> {
	const conn = resolveConnection(connectionName);
	const pool = await sqlConnect(conn);
	try {
		const parts = table.split(".");
		const schema = parts.length > 1 ? parts[0] : undefined;
		const name = parts.length > 1 ? parts[1] : parts[0];

		const request = pool.request().input("table", name);
		let where = "TABLE_NAME = @table";
		if (schema) {
			request.input("schema", schema);
			where += " AND TABLE_SCHEMA = @schema";
		}

		const result = await request.query(
			`SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION,
				DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT
			FROM INFORMATION_SCHEMA.COLUMNS
			WHERE ${where}
			ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION`,
		);
		const rows = (result.recordset ?? []) as Record<string, unknown>[];
		printTable(rows);
	} finally {
		await pool.close();
	}
}
