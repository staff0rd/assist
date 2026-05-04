import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import type { SqlConnection } from "./types";

export function loadConnections(): SqlConnection[] {
	const raw = loadGlobalConfigRaw();
	const sql = raw.sql as { connections?: SqlConnection[] } | undefined;
	return sql?.connections ?? [];
}

export function saveConnections(connections: SqlConnection[]): void {
	const raw = loadGlobalConfigRaw();
	const sql = (raw.sql as Record<string, unknown>) ?? {};
	sql.connections = connections;
	raw.sql = sql;
	saveGlobalConfig(raw);
}

export function getDefaultConnection(): string | undefined {
	const raw = loadGlobalConfigRaw();
	const sql = raw.sql as { defaultConnection?: string } | undefined;
	return sql?.defaultConnection;
}

export function setDefaultConnection(name: string): void {
	const raw = loadGlobalConfigRaw();
	const sql = (raw.sql as Record<string, unknown>) ?? {};
	sql.defaultConnection = name;
	raw.sql = sql;
	saveGlobalConfig(raw);
}
