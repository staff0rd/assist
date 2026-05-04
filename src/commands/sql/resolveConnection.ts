import { resolveNamedConnection } from "../../shared/resolveNamedConnection";
import { getDefaultConnection, loadConnections } from "./loadConnections";
import type { SqlConnection } from "./types";

export function resolveConnection(name?: string): SqlConnection {
	return resolveNamedConnection(
		loadConnections(),
		name,
		getDefaultConnection(),
		"SQL",
		"assist sql auth add",
	);
}
