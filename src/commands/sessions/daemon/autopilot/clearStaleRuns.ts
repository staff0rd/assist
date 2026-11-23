import { daemonLog } from "../daemonLog";
import type { AutopilotStore } from "./createAutopilotStore";

/** Drop the live run of any record that is no longer a scheduled repo here. */
export function clearStaleRuns(
	store: AutopilotStore,
	scheduled: string[],
): void {
	for (const cwd of store.cwds()) {
		const current = store.repo(cwd).current;
		if (!current || scheduled.includes(cwd)) continue;
		daemonLog(
			`autopilot: ${cwd} is not scheduled here; clearing its stale run ${current.sessionId}`,
		);
		store.update(cwd, (repo) => {
			repo.current = undefined;
		});
	}
}
