import type {
	ReleaseNodeState,
	ReleaseRunNodeState,
} from "../../../../../../../../../../releases/types";
import { formatReleaseDuration } from "./formatReleaseDuration";
import type { ReleaseRunMark } from "../releaseNodeState";

function took(run: ReleaseRunNodeState): string | null {
	if (!run.startedAt || !run.completedAt) return null;
	return formatReleaseDuration(
		Date.parse(run.completedAt) - Date.parse(run.startedAt),
	);
}

export function releaseRunFinished(
	node: ReleaseNodeState,
	run: ReleaseRunNodeState,
): ReleaseRunMark {
	const duration = took(run);
	if (run.status === "fail")
		return {
			tone: "fail",
			glyph: "✕",
			short: duration ?? run.conclusion ?? "failed",
			tooltip: duration
				? `Failed after ${duration} — ${run.conclusion ?? "no conclusion"}`
				: `Failed — ${run.conclusion ?? "no conclusion"}`,
		};
	const verb = node.kind === "environment" ? "Deployed" : "Built";
	return {
		tone: "ok",
		glyph: "✔",
		short: duration ?? "done",
		tooltip: duration ? `${verb} in ${duration}` : `${verb} by this run`,
	};
}
