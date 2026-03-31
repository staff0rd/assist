import type { Command } from "commander";
import { seqAuth } from "./seq/seqAuth";
import { seqQuery } from "./seq/seqQuery";
import { seqSetConnection } from "./seq/seqSetConnection";

export function registerSeq(program: Command): void {
	const cmd = program.command("seq").description("Seq log query utilities");

	const auth = cmd.command("auth").description("Configure a Seq connection");
	auth
		.command("add")
		.description("Add a new connection")
		.action(() => seqAuth.add());
	auth
		.command("list")
		.description("List configured connections")
		.action(() => seqAuth.list());
	auth
		.command("remove <name>")
		.description("Remove a configured connection")
		.action((name: string) => seqAuth.remove(name));

	cmd
		.command("set-connection <name>")
		.description("Set the default Seq connection")
		.action((name: string) => seqSetConnection(name));

	cmd
		.command("query <filter>")
		.description("Query Seq events with a filter expression")
		.option("-c, --connection <name>", "Connection to use")
		.option("-n, --count <n>", "Number of events to fetch", "50")
		.option("--from <date>", "Start date (UTC) for the query window")
		.option("--json", "Output raw JSON")
		.action((filter: string, options) => seqQuery(filter, options));
}
