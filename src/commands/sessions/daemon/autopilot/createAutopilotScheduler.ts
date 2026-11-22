import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStatus } from "./AutopilotStatus";
import { autopilotStatuses } from "./autopilotStatuses";
import { controlAutopilotTarget } from "./controlAutopilotTarget";
import { createAutopilotRuns } from "./createAutopilotRuns";
import {
	type AutopilotStore,
	createAutopilotStore,
} from "./createAutopilotStore";
import { listAutopilotTargets } from "./listAutopilotTargets";
import {
	type AutopilotControlResult,
	runAutopilotNow,
} from "./runAutopilotNow";
import { tickAutopilotRepo } from "./tickAutopilotRepo";

const CHECK_MS = 60_000;

export function createAutopilotScheduler(
	store: AutopilotStore = createAutopilotStore(),
) {
	let started: AutopilotStarted | undefined;

	const tick = (): void => {
		if (!started) return;
		for (const target of listAutopilotTargets(started.deps.localNode()))
			if (target.scheduledHere) tickAutopilotRepo(store, started.runs, target);
	};

	return {
		start(deps: AutopilotDeps): () => void {
			started = { deps, runs: createAutopilotRuns(store, deps) };
			store.load();
			tick();
			const timer = setInterval(tick, CHECK_MS);
			timer.unref();
			return () => clearInterval(timer);
		},
		status: (cwd: string): AutopilotStatus | undefined =>
			autopilotStatuses(store, started, cwd)[0],
		statuses: (): AutopilotStatus[] => autopilotStatuses(store, started),
		runNow: (cwd: string): AutopilotControlResult =>
			controlAutopilotTarget(started, cwd, ({ runs }, target) =>
				runAutopilotNow(runs, target),
			),
		setPaused: (cwd: string, paused: boolean): AutopilotControlResult =>
			controlAutopilotTarget(started, cwd, () => {
				daemonLog(`autopilot: ${cwd} ${paused ? "paused" : "resumed"}`);
				store.update(cwd, (repo) => {
					repo.paused = paused;
				});
				return { ok: true };
			}),
	};
}
