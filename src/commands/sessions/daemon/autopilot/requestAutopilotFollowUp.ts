import { formatItemId } from "../../../backlog/formatItemId";
import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import { autopilotControlTarget } from "./autopilotControlTarget";
import { resolveRunOwner } from "./resolveRunOwner";
import type { AutopilotStore } from "./createAutopilotStore";

export type AutopilotFollowUpResult =
	| { ok: true; cwd: string; at: string }
	| { ok: false; error: string };

export function requestAutopilotFollowUp(
	store: AutopilotStore,
	started: AutopilotStarted | undefined,
	sessionId: string,
	delayMs: number,
): AutopilotFollowUpResult {
	const owner = resolveRunOwner(store, started, sessionId);
	if ("error" in owner) return { ok: false, error: owner.error };
	const { cwd } = owner;
	const found = autopilotControlTarget(cwd, owner.started.deps.localNode());
	if ("error" in found) return { ok: false, error: found.error };
	const itemId = owner.started.deps.sessionLink(sessionId)?.itemId;
	const now = Date.now();
	const at = new Date(now + delayMs).toISOString();
	store.update(cwd, (repo) => {
		repo.followUp = {
			at,
			requestedAt: new Date(now).toISOString(),
			sessionId,
			...(itemId === undefined ? {} : { item: formatItemId(itemId) }),
		};
	});
	daemonLog(`autopilot: ${cwd} follow-up at ${at} requested by ${sessionId}`);
	return { ok: true, cwd, at };
}
