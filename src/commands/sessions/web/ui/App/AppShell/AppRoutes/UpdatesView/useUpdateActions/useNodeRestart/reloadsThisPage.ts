import type { NodeUpdateEntry } from "../../../../NodeUpdateEntry";

export function reloadsThisPage(entry: NodeUpdateEntry): boolean {
	return entry.local && (entry.status?.restart.includes("webserver") ?? false);
}
