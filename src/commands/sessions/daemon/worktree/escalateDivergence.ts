import { createSession } from "../createSession";
import { daemonLog } from "../daemonLog";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { canonicalTreePath } from "./canonicalTreePath";
import { divergencePrompt } from "./divergencePrompt";
import { liveEscalationIn } from "./liveEscalationIn";

export function escalateDivergence(
	ctx: TreeSpawnContext,
	cwd: string,
	output: string,
): string {
	const clone = canonicalTreePath(cwd);
	const live = liveEscalationIn(ctx.sessions, clone);
	if (live) {
		daemonLog(
			`auto-update diverged in the clone ${clone}: no escalation spawned, session ${live.id} is already diagnosing it (${live.status})`,
		);
		return live.id;
	}
	const prompt = divergencePrompt(clone, output);
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
		`auto-update diverged in the clone ${clone}: spawned escalation session ${id} to diagnose it`,
	);
	return id;
}
