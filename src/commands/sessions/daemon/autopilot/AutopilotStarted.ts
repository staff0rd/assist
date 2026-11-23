import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotRuns } from "./createAutopilotRuns";
import type { ItemStatusCache } from "./createItemStatusCache";

export type AutopilotStarted = {
	deps: AutopilotDeps;
	runs: AutopilotRuns;
	items: ItemStatusCache;
};
