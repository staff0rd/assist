import type { NodeUpdateEntry } from "./NodeUpdateEntry";

export function isUpdateReady(entry: NodeUpdateEntry): boolean {
	return (entry.status?.restart.length ?? 0) > 0;
}
