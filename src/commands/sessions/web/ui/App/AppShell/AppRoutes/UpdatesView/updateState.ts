import { formatRelativeTime } from "../../../../formatRelativeTime";
import { isUpdateReady } from "../../isUpdateReady";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { restartLabel } from "./restartLabel";

export type UpdateStateKind =
	| "ok"
	| "ready"
	| "diverged"
	| "retrying"
	| "off"
	| "unavailable";

export type UpdateState = {
	kind: UpdateStateKind;
	label: string;
	line: string;
};

export function updateState(entry: NodeUpdateEntry): UpdateState {
	const { status } = entry;
	if (!status)
		return {
			kind: "unavailable",
			label: "Unavailable",
			line: entry.error ?? "no update state",
		};
	const { loop } = status;
	const since = formatRelativeTime(loop.since);
	if (loop.phase === "diverged")
		return {
			kind: "diverged",
			label: "Diverged · fixing",
			line: `diverged ${since}${loop.escalationId ? ` · session ${loop.escalationId}` : ""}`,
		};
	if (isUpdateReady(entry))
		return {
			kind: "ready",
			label: "Restart to update",
			line: `restart ${status.restart.map(restartLabel).join(" + ")}`,
		};
	if (loop.phase === "off")
		return { kind: "off", label: "Off", line: loop.reason ?? "not running" };
	if (loop.phase === "retrying")
		return {
			kind: "retrying",
			label: "Retrying",
			line: `${loop.reason ?? "lap failed"} · ${since}`,
		};
	return {
		kind: "ok",
		label: "Up to date",
		line: `watching origin since ${since}`,
	};
}
