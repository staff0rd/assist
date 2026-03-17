import chalk from "chalk";
import { loadGlobalConfigRaw } from "../../shared/loadConfig";
import type { RavendbConnection } from "./types";

function loadRavendb() {
	const raw = loadGlobalConfigRaw();
	const ravendb = raw.ravendb as
		| { connections?: RavendbConnection[]; defaultConnection?: string }
		| undefined;
	return {
		connections: ravendb?.connections ?? [],
		defaultConnection: ravendb?.defaultConnection,
	};
}

export function resolveConnection(name?: string): RavendbConnection {
	const { connections, defaultConnection } = loadRavendb();
	const connectionName = name ?? defaultConnection;

	if (!connectionName) {
		console.error(
			chalk.red(
				"No connection specified and no default set. Use assist ravendb set-connection <name> or pass a connection name.",
			),
		);
		process.exit(1);
	}

	const connection = connections.find((c) => c.name === connectionName);
	if (!connection) {
		console.error(chalk.red(`Connection "${connectionName}" not found.`));
		console.error(
			`Available: ${connections.map((c) => c.name).join(", ") || "(none)"}`,
		);
		console.error("Run assist ravendb auth to add a connection.");
		process.exit(1);
	}

	return connection;
}

/** When first arg might be a connection or a collection, disambiguate. */
export function resolveArgs(
	first?: string,
	second?: string,
): { connection: RavendbConnection; collection?: string } {
	const { connections } = loadRavendb();
	const isConnection = first && connections.some((c) => c.name === first);

	if (isConnection) {
		return { connection: resolveConnection(first), collection: second };
	}

	// first arg is not a connection name — treat it as collection
	return { connection: resolveConnection(undefined), collection: first };
}
