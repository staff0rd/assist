import type { ReleaseEnvironmentState } from "../releases/types";

type ReleaseNodeTone = "ok" | "drift" | "idle";

type ReleaseNodeState = {
	tone: ReleaseNodeTone;
	glyph: string;
	tooltip: string;
};

export const releaseToneColors: Record<ReleaseNodeTone, string> = {
	ok: "success.main",
	drift: "error.main",
	idle: "text.secondary",
};

export function releaseNodeState(
	environment: ReleaseEnvironmentState,
	defaultBranch: string | null,
): ReleaseNodeState {
	const branch = defaultBranch ?? "the default branch";
	if (!environment.sha)
		return {
			tone: "idle",
			glyph: "○",
			tooltip: "No successful deployment recorded for this environment",
		};
	if (environment.behind === null)
		return {
			tone: "idle",
			glyph: "●",
			tooltip: `Live, but its distance from ${branch} could not be read`,
		};
	if (environment.behind === 0)
		return {
			tone: "ok",
			glyph: "●",
			tooltip: `Running the latest commit on ${branch}`,
		};
	const commits = environment.behind === 1 ? "commit" : "commits";
	return {
		tone: "drift",
		glyph: "▲",
		tooltip: `Behind ${branch} by ${environment.behind} ${commits}`,
	};
}
