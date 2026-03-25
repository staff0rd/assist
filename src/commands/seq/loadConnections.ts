import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import type { SeqConnection } from "./types";

export function loadConnections(): SeqConnection[] {
	const raw = loadGlobalConfigRaw();
	const seq = raw.seq as { connections?: SeqConnection[] } | undefined;
	return seq?.connections ?? [];
}

export function saveConnections(connections: SeqConnection[]): void {
	const raw = loadGlobalConfigRaw();
	const seq = (raw.seq as Record<string, unknown>) ?? {};
	seq.connections = connections;
	raw.seq = seq;
	saveGlobalConfig(raw);
}

export function getDefaultConnection(): string | undefined {
	const raw = loadGlobalConfigRaw();
	const seq = raw.seq as { defaultConnection?: string } | undefined;
	return seq?.defaultConnection;
}

export function setDefaultConnection(name: string): void {
	const raw = loadGlobalConfigRaw();
	const seq = (raw.seq as Record<string, unknown>) ?? {};
	seq.defaultConnection = name;
	raw.seq = seq;
	saveGlobalConfig(raw);
}
