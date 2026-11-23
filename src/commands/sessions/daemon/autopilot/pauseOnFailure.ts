import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotFailure } from "./AutopilotRecord";
import type { AutopilotStore } from "./createAutopilotStore";

/** Pause the repo's schedule, record why and notify; a no-op once paused. */
export function pauseOnFailure(
	store: AutopilotStore,
	deps: AutopilotDeps,
	cwd: string,
	failure: Omit<AutopilotFailure, "at">,
): void {
	if (store.repo(cwd).paused) {
		daemonLog(
			`autopilot: ${cwd} already paused; not recording failure: ${failure.reason}`,
		);
		return;
	}
	const where = [failure.item, failure.phase].filter(Boolean).join(" ");
	daemonLog(
		`autopilot: ${cwd} paused on failure${where ? ` (${where})` : ""}: ${failure.reason}`,
	);
	store.update(cwd, (repo) => {
		repo.paused = true;
		repo.failure = { at: new Date().toISOString(), ...failure };
		repo.pauseReason = undefined;
	});
	const repoName = cwd.split(/[/\\]/).pop() ?? cwd;
	deps.notify?.(
		`Autopilot paused: ${repoName}`,
		where ? `${where}: ${failure.reason}` : failure.reason,
	);
}
