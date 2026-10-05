import { formatRelativeTime } from "../../../../formatRelativeTime";
import { isUpdateReady } from "../../isUpdateReady";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { loopUpdateState } from "./updateState/loopUpdateState";
import { restartLabel } from "./restartLabel";
import type { UpdateState } from "./UpdateStateKind";

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
			line: `restart ${status.restart.map(restartLabel).join(" + ")}${loop.paused ? " · paused" : ""}`,
		};
	return loopUpdateState(loop, since);
}
