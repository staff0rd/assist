import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { registerRavendbAuth } from "./ravendb/registerRavendbAuth";
import { ravendbConfigHelp } from "./ravendb/ravendbConfigHelp";

export function registerRavendb(program: Command): void {
	const cmd = program.command("ravendb").description("RavenDB query utilities");

	registerRavendbAuth(cmd);

	cmd
		.command("set-connection <name>")
		.description("Set the default connection")
		.action(async (name: string) =>
			(await import("./ravendb/ravendbSetConnection")).ravendbSetConnection(
				name,
			),
		);

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
			async (
				connection: string | undefined,
				collection: string | undefined,
				options,
			) =>
				(await import("./ravendb/ravendbQuery")).ravendbQuery(
					connection,
					collection,
					options,
				),
		);

	cmd
		.command("collections [connection]")
		.description("List collections in a RavenDB database")
		.action(async (connection?: string) =>
			(await import("./ravendb/ravendbCollections")).ravendbCollections(
				connection,
			),
		);

	configHelp(cmd, ravendbConfigHelp);
}
