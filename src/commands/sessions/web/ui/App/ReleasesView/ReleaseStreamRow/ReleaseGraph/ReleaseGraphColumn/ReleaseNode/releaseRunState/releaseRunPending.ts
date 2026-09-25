import type { ReleaseRunNodeState } from "../../../../../../../../releases/types";
import { formatReleaseDuration } from "./formatReleaseDuration";
import type { ReleaseRunMark } from "../releaseNodeState";

export function releaseRunPending(
	run: ReleaseRunNodeState,
	now: number,
): ReleaseRunMark | null {
	if (run.status !== "gate" && run.status !== "running") return null;
	const elapsed = run.startedAt
		? formatReleaseDuration(now - Date.parse(run.startedAt))
		: null;
	if (run.status === "gate")
		return {
			tone: "gate",
			glyph: "◑",
			short: elapsed ?? "gated",
			tooltip: elapsed
				? `Waiting for someone to approve, for ${elapsed}`
				: "Waiting for someone to approve",
		};
	return {
		tone: "gate",
		glyph: "●",
		short: elapsed ?? "running",
		tooltip: elapsed ? `Running for ${elapsed}` : "Running now",
	};
}
