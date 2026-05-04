import sql, { type ConnectionPool } from "mssql";
import type { SqlConnection } from "./types";

export async function sqlConnect(conn: SqlConnection): Promise<ConnectionPool> {
	return await sql.connect({
		server: conn.server,
		port: conn.port,
		user: conn.user,
		password: conn.password,
		database: conn.database,
		options: {
			encrypt: false,
			trustServerCertificate: true,
		},
	});
}
