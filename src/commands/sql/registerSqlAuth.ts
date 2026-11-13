import type { Command } from "commander";

export function registerSqlAuth(cmd: Command): void {
	const auth = cmd.command("auth").description("Configure a SQL connection");
	auth
		.command("add")
		.description("Add a new connection")
		.action(async () => (await import("./sqlAuth")).sqlAuth.add());
	auth
		.command("list")
		.description("List configured connections")
		.action(async () => (await import("./sqlAuth")).sqlAuth.list());
	auth
		.command("remove <name>")
		.description("Remove a configured connection")
		.action(async (name: string) =>
			(await import("./sqlAuth")).sqlAuth.remove(name),
		);
}
