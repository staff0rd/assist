import { daemonLog } from "../daemonLog";
import type { AutopilotRunSummary } from "./AutopilotRecord";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { resolveRunOwner } from "./resolveRunOwner";

export type AutopilotSummaryResult =
	| { ok: true; cwd: string }
	| { ok: false; error: string };

export function recordRunSummary(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	sessionId: string,
	summary: AutopilotRunSummary,
): AutopilotSummaryResult {
	const owner = resolveRunOwner(store, started, sessionId);
	if ("error" in owner) return { ok: false, error: owner.error };
	store.update(owner.cwd, (repo) => {
		if (repo.current) repo.current.summary = summary;
	});
	daemonLog(
		`autopilot: ${owner.cwd} run summary from ${sessionId}: decided ${JSON.stringify(summary.decided)}`,
	);
	return { ok: true, cwd: owner.cwd };
}
