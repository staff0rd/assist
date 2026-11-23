import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStore } from "./createAutopilotStore";

export function settleAutopilotRun(
	store: AutopilotStore,
	deps: AutopilotDeps,
	cwd: string,
): void {
	const current = store.repo(cwd).current;
	if (!current) return;
	const state = deps.sessionState(current.sessionId);
	if (state === "live") return;
	const reason = state === "errored" ? "session errored" : undefined;
	daemonLog(
		`autopilot: ${cwd} run ${current.sessionId} finished${reason ? ` (${reason})` : ""}`,
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
			summary: deps.sessionSummary?.(current.sessionId),
		},
		(repo) => {
			repo.current = undefined;
		},
	);
}
