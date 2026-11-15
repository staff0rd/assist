import { loadConfig } from "../../../shared/loadConfig";

/** Parallel phase runs are experimental and stay off unless backlog.parallelPhases is set. */
export function parallelPhasesEnabled(): boolean {
	return loadConfig().backlog?.parallelPhases === true;
}
