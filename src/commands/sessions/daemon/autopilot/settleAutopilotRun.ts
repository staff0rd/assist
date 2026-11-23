import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import { awaitingSummary } from "./awaitingSummary";
import type { AutopilotStore } from "./createAutopilotStore";
import { pauseOnFailure } from "./pauseOnFailure";
import { requestRunSummary } from "./requestRunSummary";
import { runFailure } from "./runFailure";

export function settleAutopilotRun(
	store: AutopilotStore,
	deps: AutopilotDeps,
	cwd: string,
): void {
	const current = store.repo(cwd).current;
	if (!current) return;
	const state = deps.sessionState(current.sessionId);
	if (state === "live" || awaitingSummary(current, state)) return;
	if (state === "ended" && requestRunSummary(store, deps, cwd)) return;
	const failure = runFailure(deps, current.sessionId, state);
	const reason = failure?.reason;
	daemonLog(
		`autopilot: ${cwd} run ${current.sessionId} finished${reason ? ` (${reason})` : ""}${current.summary ? "" : " without a summary"}`,
	);
	const items = (store.repo(cwd).items ?? [])
		.filter((item) => item.startedAt >= current.startedAt)
		.map((item) => item.id);
	store.addTick(
		cwd,
		{
			outcome: "finished",
			sessionId: current.sessionId,
			reason,
			startedAt: current.startedAt,
			items,
			summary: current.summary,
		},
		(repo) => {
			repo.current = undefined;
		},
	);
	if (failure) pauseOnFailure(store, deps, cwd, failure);
}
