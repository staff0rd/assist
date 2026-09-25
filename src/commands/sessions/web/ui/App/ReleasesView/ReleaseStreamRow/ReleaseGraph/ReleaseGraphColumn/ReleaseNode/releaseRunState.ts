import type {
	ReleaseNodeState,
	ReleaseRunNodeState,
} from "../../../../../../../releases/types";
import type { ReleaseRunMark } from "./releaseNodeState";
import { releaseRunFinished } from "./releaseRunState/releaseRunFinished";
import { releaseRunPending } from "./releaseRunState/releaseRunPending";

const NO_RUN: ReleaseRunMark = {
	tone: "idle",
	glyph: "○",
	short: "no run",
	tooltip: "No run of this workflow to read",
};

function untouched(run: ReleaseRunNodeState): ReleaseRunMark {
	const why = run.conclusion ?? "not started";
	return {
		tone: "idle",
		glyph: "○",
		short: why,
		tooltip: `This run never got here — ${why}`,
	};
}

export function releaseRunState(
	node: ReleaseNodeState,
	now: number,
): ReleaseRunMark {
	const run = node.run;
	if (!run) return NO_RUN;
	if (run.status === "idle") return untouched(run);
	return releaseRunPending(run, now) ?? releaseRunFinished(node, run);
}
