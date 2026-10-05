import type { AutoUpdateLoopState } from "../../../../../../../shared/AutoUpdateLoopState";
import type { UpdateState } from "../UpdateStateKind";

export function loopUpdateState(
	loop: AutoUpdateLoopState,
	since: string,
): UpdateState {
	if (loop.paused)
		return {
			kind: "paused",
			label: "Paused",
			line: "won't pull until resumed",
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
