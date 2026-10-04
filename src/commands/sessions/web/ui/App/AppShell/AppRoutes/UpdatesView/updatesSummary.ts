import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { updateState } from "./updateState";

export function updatesSummary(entries: NodeUpdateEntry[]): string {
	const kinds = entries.map((entry) => updateState(entry).kind);
	const count = (kind: string) => kinds.filter((k) => k === kind).length;
	const ready = count("ready");
	const parts = [`${entries.length} node${entries.length === 1 ? "" : "s"}`];
	parts.push(
		ready ? `${ready} ready to restart` : "all running their latest build",
	);
	if (count("diverged")) parts.push(`${count("diverged")} diverged`);
	if (count("unavailable")) parts.push(`${count("unavailable")} unavailable`);
	return parts.join(" · ");
}
