import { setNamedDefaultConnection } from "../../shared/setNamedDefaultConnection";
import { loadConnections, setDefaultConnection } from "./loadConnections";

export function sqlSetConnection(name: string): void {
	setNamedDefaultConnection(
		loadConnections(),
		name,
		setDefaultConnection,
		"SQL",
	);
}
