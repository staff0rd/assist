import { hostLabel } from "../../HomeNodeGate/hostLabel";
import type { Connection } from "../../HomeNodeGate/toConnection";

export function homeNodeDetail(connection: Connection, url: string): string {
	if (connection.kind === "unreachable")
		return `${hostLabel(url)} · unreachable`;
	const version =
		connection.kind === "connected" ? connection.health.version : undefined;
	return version ? `${hostLabel(url)} · v${version}` : hostLabel(url);
}
