import { loadConfig } from "../../../shared/loadConfig";
import { inWebSession } from "../../sessions/shared/inWebSession";
import { worktreeConfigFor } from "../../sessions/daemon/worktree/worktreeConfigFor";

const DEFAULT_MAX_PARALLEL_PHASES = 3;

/** How many phases may run at once: 1 unless this run is a daemon session whose repo gives every session its own worktree. */
export function parallelPhaseCap(cwd: string): number {
	const cap =
		loadConfig().backlog?.maxParallelPhases ?? DEFAULT_MAX_PARALLEL_PHASES;
	if (cap < 2 || !inWebSession() || !worktreeConfigFor(cwd).enabled) return 1;
	return cap;
}
