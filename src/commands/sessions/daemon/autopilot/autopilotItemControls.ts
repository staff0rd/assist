import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { resumeAutopilotItem } from "./resumeAutopilotItem";
import type { AutopilotControlResult } from "./runAutopilotNow";
import { stopAutopilotItem } from "./stopAutopilotItem";
import { stopAutopilotRun } from "./stopAutopilotRun";

export function autopilotItemControls(
	store: AutopilotStore,
	started: () => AutopilotStarted | undefined,
) {
	return {
		stopItem: (cwd: string, itemId?: number): AutopilotControlResult =>
			itemId === undefined
				? stopAutopilotRun(started(), cwd)
				: stopAutopilotItem(store, started(), cwd, itemId),
		resumeItem: (cwd: string, itemId: number): AutopilotControlResult =>
			resumeAutopilotItem(store, started(), cwd, itemId),
	};
}
