import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { registerSqlAuth } from "./sql/registerSqlAuth";
import { sqlConfigHelp } from "./sql/sqlConfigHelp";

export function registerSql(program: Command): void {
	const cmd = program.command("sql").description("MSSQL query utilities");

	registerSqlAuth(cmd);

	cmd
		.command("set-connection <name>")
		.description("Set the default SQL connection")
		.action(async (name: string) =>
			(await import("./sql/sqlSetConnection")).sqlSetConnection(name),
		);

	cmd
		.command("query <sql> [connection]")
		.description("Execute a read-only SQL query (rejects mutating statements)")
		.action(async (query: string, connection?: string) =>
			(await import("./sql/sqlQuery")).sqlQuery(query, connection),
		);

	cmd
		.command("mutate <sql> [connection]")
		.description(
			"Execute a mutating SQL statement (rejects non-mutating statements)",
		)
		.action(async (query: string, connection?: string) =>
			(await import("./sql/sqlMutate")).sqlMutate(query, connection),
		);

	cmd
		.command("tables [connection]")
		.description("List tables in the connected database")
		.action(async (connection?: string) =>
			(await import("./sql/sqlTables")).sqlTables(connection),
		);

	cmd
		.command("columns <table> [connection]")
		.description(
			"List columns for a table (use schema.table for non-default schema)",
		)
		.action(async (table: string, connection?: string) =>
			(await import("./sql/sqlColumns")).sqlColumns(table, connection),
		);

	configHelp(cmd, sqlConfigHelp);
}
