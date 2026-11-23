import { formatItemId } from "../../../backlog/formatItemId";
import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { pauseOnFailure } from "./pauseOnFailure";
import { resolveRunOwner } from "./resolveRunOwner";

export type AutopilotFailureReport = { reason: string; phase?: string };

type AutopilotFailureResult =
	| { ok: true; cwd: string }
	| { ok: false; error: string };

/** Pause the schedule whose live run the session belongs to. */
export function reportAutopilotFailure(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	sessionId: string,
	report: AutopilotFailureReport,
): AutopilotFailureResult {
	const owner = resolveRunOwner(store, started, sessionId);
	if ("error" in owner) {
		daemonLog(
			`autopilot: failure from ${sessionId} ignored (${owner.error}): ${report.reason}`,
		);
		return { ok: false, error: owner.error };
	}
	const link = owner.started.deps.sessionLink(sessionId);
	const itemId = link?.itemId;
	const stopped = store
		.repo(owner.cwd)
		.items?.some((item) => item.id === itemId && item.stopped);
	if (stopped) {
		daemonLog(
			`autopilot: failure from ${sessionId} ignored (item stopped from the page): ${report.reason}`,
		);
		return { ok: false, error: "the item was stopped from the page" };
	}
	pauseOnFailure(store, owner.started.deps, owner.cwd, {
		...report,
		phase: report.phase ?? link?.phase,
		sessionId,
		...(itemId === undefined ? {} : { item: formatItemId(itemId) }),
	});
	return { ok: true, cwd: owner.cwd };
}
