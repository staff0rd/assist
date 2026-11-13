import { Pool } from "pg";
import { getDatabaseUrl } from "./getDatabaseUrl";

// why: an unhandled 'error' from an idle client crashes the process; absorb it so the pool just reconnects.
function logPoolError(error: Error): void {
	console.error(
		`${new Date().toISOString()} backlog pool error: ${error.message}`,
	);
}

// why: a checked-out client has no pool idle listener, so a socket error with no active query emits 'error' on the client itself and would crash the process.
function logClientError(error: Error): void {
	console.error(
		`${new Date().toISOString()} backlog client error: ${error.message}`,
	);
}

export function createPool(): Pool {
	const pool = new Pool({
		connectionString: getDatabaseUrl(),
		max: 10,
		// why: retire idle clients before managed Postgres (Supabase/Neon) drops them server-side, so we never check out a dead socket and stall on a timeout.
		idleTimeoutMillis: 30_000,
		// why: bound the wait for a free client so a degraded pool fails fast (500 + log line) rather than hanging for seconds.
		connectionTimeoutMillis: 10_000,
	});
	pool.on("error", logPoolError);
	pool.on("acquire", (client) => client.on("error", logClientError));
	pool.on("release", (_error, client) =>
		client.removeListener("error", logClientError),
	);
	return pool;
}
