import type { Command } from "commander";

export function registerRavendbAuth(cmd: Command): void {
	const auth = cmd
		.command("auth")
		.description("Configure a named RavenDB connection");
	auth
		.command("add")
		.description("Add a new connection")
		.action(async () => (await import("./ravendbAuth")).ravendbAuth.add());
	auth
		.command("list")
		.description("List configured connections")
		.action(async () => (await import("./ravendbAuth")).ravendbAuth.list());
	auth
		.command("remove <name>")
		.description("Remove a configured connection")
		.action(async (name: string) =>
			(await import("./ravendbAuth")).ravendbAuth.remove(name),
		);
}
