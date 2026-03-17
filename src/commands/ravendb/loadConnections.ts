import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import type { RavendbConnection } from "./types";

export function loadConnections(): RavendbConnection[] {
	const raw = loadGlobalConfigRaw();
	const ravendb = raw.ravendb as
		| { connections?: RavendbConnection[] }
		| undefined;
	return ravendb?.connections ?? [];
}

export function saveConnections(connections: RavendbConnection[]): void {
	const raw = loadGlobalConfigRaw();
	const ravendb = (raw.ravendb as Record<string, unknown>) ?? {};
	ravendb.connections = connections;
	raw.ravendb = ravendb;
	saveGlobalConfig(raw);
}
