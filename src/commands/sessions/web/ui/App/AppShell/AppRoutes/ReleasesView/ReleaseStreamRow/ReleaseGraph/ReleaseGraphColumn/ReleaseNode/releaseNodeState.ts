import type { ReleaseNodeState } from "../../../../../../../../../releases/types";
import type { ReleaseTone } from "../../../../releaseToneColors";

export type ReleaseMarkState = {
	tone: ReleaseTone;
	glyph: string;
	tooltip: string;
};

export type ReleaseRunMark = ReleaseMarkState & { short: string };

export function releaseNodeState(
	node: ReleaseNodeState,
	defaultBranch: string | null,
): ReleaseMarkState {
	const branch = defaultBranch ?? "the default branch";
	if (node.kind !== "environment")
		return {
			tone: "idle",
			glyph: "○",
			tooltip:
				node.kind === "gate"
					? "An approval step, not a deployable environment"
					: "A build step, not a deployable environment",
		};
	if (!node.live)
		return {
			tone: "idle",
			glyph: "○",
			tooltip: "No successful deployment recorded for this environment",
		};
	if (node.behind === null)
		return {
			tone: "idle",
			glyph: "●",
			tooltip: `Live, but its distance from ${branch} could not be read`,
		};
	if (node.behind === 0)
		return {
			tone: "ok",
			glyph: "●",
			tooltip: `Running the latest commit on ${branch}`,
		};
	const commits = node.behind === 1 ? "commit" : "commits";
	if (node.queued)
		return {
			tone: "gate",
			glyph: "◑",
			tooltip: `Behind ${branch} by ${node.behind} ${commits}, with a newer commit waiting for approval`,
		};
	return {
		tone: "drift",
		glyph: "▲",
		tooltip: `Behind ${branch} by ${node.behind} ${commits}, and nothing is queued to fix it`,
	};
}
