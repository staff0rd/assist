import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotRuns } from "./createAutopilotRuns";
import type { ItemStatusCache } from "./createItemStatusCache";

export type AutopilotStarted = {
	deps: AutopilotDeps;
	runs: AutopilotRuns;
	items: ItemStatusCache;
	/** Per session: the idle stretch last answered, how many were answered, and whether it was asked to hand a background wait to the next tick. */
	nudges: Map<
		string,
		{ waitingSince: number; count: number; handedOff?: boolean }
	>;
};
