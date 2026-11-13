import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { seqConfigHelp } from "./seq/seqConfigHelp";

export function registerSeq(program: Command): void {
	const cmd = program.command("seq").description("Seq log query utilities");

	const auth = cmd.command("auth").description("Configure a Seq connection");
	auth
		.command("add")
		.description("Add a new connection")
		.action(async () => (await import("./seq/seqAuth")).seqAuth.add());
	auth
		.command("list")
		.description("List configured connections")
		.action(async () => (await import("./seq/seqAuth")).seqAuth.list());
	auth
		.command("remove <name>")
		.description("Remove a configured connection")
		.action(async (name: string) =>
			(await import("./seq/seqAuth")).seqAuth.remove(name),
		);

	cmd
		.command("set-connection <name>")
		.description("Set the default Seq connection")
		.action(async (name: string) =>
			(await import("./seq/seqSetConnection")).seqSetConnection(name),
		);

	cmd
		.command("query <filter>")
		.description("Query Seq events with a filter expression")
		.option("-c, --connection <name>", "Connection to use")
		.option("-n, --count <n>", "Number of events to fetch", "50")
		.option(
			"--from <date>",
			"Start of query window (UTC date or relative e.g. 5m, 1h, 2d)",
		)
		.option(
			"--to <date>",
			"End of query window (UTC date or relative e.g. 5m, 1h, 2d)",
		)
		.option("--json", "Output raw JSON")
		.action(async (filter: string, options) =>
			(await import("./seq/seqQuery")).seqQuery(filter, options),
		);

	configHelp(cmd, seqConfigHelp);
}
