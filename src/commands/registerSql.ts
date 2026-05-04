import type { Command } from "commander";
import { sqlAuth } from "./sql/sqlAuth";
import { sqlColumns } from "./sql/sqlColumns";
import { sqlMutate } from "./sql/sqlMutate";
import { sqlQuery } from "./sql/sqlQuery";
import { sqlSetConnection } from "./sql/sqlSetConnection";
import { sqlTables } from "./sql/sqlTables";

export function registerSql(program: Command): void {
	const cmd = program.command("sql").description("MSSQL query utilities");

	const auth = cmd.command("auth").description("Configure a SQL connection");
	auth
		.command("add")
		.description("Add a new connection")
		.action(() => sqlAuth.add());
	auth
		.command("list")
		.description("List configured connections")
		.action(() => sqlAuth.list());
	auth
		.command("remove <name>")
		.description("Remove a configured connection")
		.action((name: string) => sqlAuth.remove(name));

	cmd
		.command("set-connection <name>")
		.description("Set the default SQL connection")
		.action((name: string) => sqlSetConnection(name));

	cmd
		.command("query <sql> [connection]")
		.description("Execute a read-only SQL query (rejects mutating statements)")
		.action((query: string, connection?: string) =>
			sqlQuery(query, connection),
		);

	cmd
		.command("mutate <sql> [connection]")
		.description(
			"Execute a mutating SQL statement (rejects non-mutating statements)",
		)
		.action((query: string, connection?: string) =>
			sqlMutate(query, connection),
		);

	cmd
		.command("tables [connection]")
		.description("List tables in the connected database")
		.action((connection?: string) => sqlTables(connection));

	cmd
		.command("columns <table> [connection]")
		.description(
			"List columns for a table (use schema.table for non-default schema)",
		)
		.action((table: string, connection?: string) =>
			sqlColumns(table, connection),
		);
}
