import chalk from "chalk";
import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import type { RavendbConnection } from "./types";

export function ravendbSetConnection(name: string): void {
	const raw = loadGlobalConfigRaw();
	const ravendb = (raw.ravendb as Record<string, unknown>) ?? {};
	const connections = (ravendb.connections as RavendbConnection[]) ?? [];

	if (!connections.some((c) => c.name === name)) {
		console.error(chalk.red(`Connection "${name}" not found.`));
		console.error(
			`Available: ${connections.map((c) => c.name).join(", ") || "(none)"}`,
		);
		process.exit(1);
	}

	ravendb.defaultConnection = name;
	raw.ravendb = ravendb;
	saveGlobalConfig(raw);
	console.log(`Default connection set to "${name}".`);
}
