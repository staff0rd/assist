import type { NodeUpdateEntry } from "../../NodeUpdateEntry";

export function canControl(entry: NodeUpdateEntry): boolean {
	const loop = entry.status?.loop;
	return loop !== undefined && (loop.phase !== "off" || loop.paused === true);
}
