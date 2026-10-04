import { createSession } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { Session } from "../types";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { canonicalTreePath } from "./canonicalTreePath";
import { divergencePrompt } from "./divergencePrompt";

const ENDED: Session["status"][] = ["done", "error", "stopped"];

export function escalateDivergence(
	ctx: TreeSpawnContext,
	watcher: Session,
): string | undefined {
	if (!watcher.cwd) return undefined;
	const clone = canonicalTreePath(watcher.cwd);
	const live = [...ctx.sessions.values()].find(
		(s) =>
			s.divergenceEscalation === true &&
			s.cwd !== undefined &&
			canonicalTreePath(s.cwd) === clone &&
			!ENDED.includes(s.status),
	);
	if (live) {
		daemonLog(
			`watcher session ${watcher.id} exited 3 (divergence) in the clone ${clone}: no escalation spawned, session ${live.id} is already diagnosing it (${live.status})`,
		);
		return undefined;
	}
	const prompt = divergencePrompt(clone, watcher.scrollback);
	const id = allocateAndBind(
		ctx,
		clone,
		(sid, resolvedCwd) => ({
			...createSession(sid, { prompt, cwd: resolvedCwd ?? clone }),
			divergenceEscalation: true,
		}),
		{ inPlace: true },
	);
	daemonLog(
		`watcher session ${watcher.id} exited 3 (divergence) in the clone ${clone}: spawned escalation session ${id} to diagnose it`,
	);
	return id;
}
