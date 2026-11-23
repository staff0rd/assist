import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotRuns } from "./createAutopilotRuns";
import type { ItemStatusCache } from "./createItemStatusCache";

export type AutopilotStarted = {
	deps: AutopilotDeps;
	runs: AutopilotRuns;
	items: ItemStatusCache;
	/** Per session: the idle stretch last answered and how many were answered. */
	nudges: Map<string, { waitingSince: number; count: number }>;
};
