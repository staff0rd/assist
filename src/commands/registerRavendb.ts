import type { Command } from "commander";
import { ravendbAuth } from "./ravendb/ravendbAuth";
import { ravendbCollections } from "./ravendb/ravendbCollections";
import { ravendbQuery } from "./ravendb/ravendbQuery";
import { ravendbSetConnection } from "./ravendb/ravendbSetConnection";

export function registerRavendb(program: Command): void {
	const cmd = program.command("ravendb").description("RavenDB query utilities");

	cmd
		.command("auth")
		.description("Configure a named RavenDB connection")
		.option("--list", "List configured connections")
		.option("--remove <name>", "Remove a configured connection")
		.action((options) => ravendbAuth(options));

	cmd
		.command("set-connection <name>")
		.description("Set the default connection")
		.action((name: string) => ravendbSetConnection(name));

	cmd
		.command("query [connection] [collection]")
		.description("Query a RavenDB collection")
		.option("--page-size <n>", "Documents per page", "25")
		.option(
			"--sort <field>",
			"Sort field (prefix - for descending)",
			"-@metadata.Last-Modified",
		)
		.option("--query <lucene>", "Lucene filter query")
		.option("--limit <n>", "Max total documents to fetch")
		.action(
			(
				connection: string | undefined,
				collection: string | undefined,
				options,
			) => ravendbQuery(connection, collection, options),
		);

	cmd
		.command("collections [connection]")
		.description("List collections in a RavenDB database")
		.action((connection?: string) => ravendbCollections(connection));
}
