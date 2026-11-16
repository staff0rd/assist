import type { PathState } from "./pendingPathAction";
import { pathsOutcome } from "./pathsOutcome";
import type { InstallFailure, SeedOutcome } from "./SeedOutcome";

export function pathsProgress(
	paths: string[],
	states: PathState[],
	failures: (InstallFailure | undefined)[],
	onInstalling: (path?: string) => void,
): SeedOutcome | undefined {
	const running = paths.filter((_, i) => states[i] === "running");
	if (running.length > 0) {
		onInstalling(running.join(", "));
		return undefined;
	}
	if (states.includes("pending")) return undefined;
	return pathsOutcome(paths, states, failures);
}
