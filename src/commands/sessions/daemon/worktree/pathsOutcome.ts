import type { PathState } from "./pendingPathAction";
import type { InstallFailure, SeedOutcome } from "./SeedOutcome";

export function pathsOutcome(
	paths: string[],
	states: PathState[],
	failures: (InstallFailure | undefined)[],
): SeedOutcome {
	const failed = failures.find((failure) => failure !== undefined);
	if (failed) return { ok: false, ...failed };
	const skipped = states.indexOf("skipped");
	if (skipped === -1) return { ok: true };
	return { ok: false, path: paths[skipped], reason: "skipped", output: "" };
}
