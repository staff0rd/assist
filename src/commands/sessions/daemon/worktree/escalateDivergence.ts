import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import { divergenceEscalationFeature } from "../../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../../shared/harnessAdapters/launchBlocker";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
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
	const harness = loadConfigFrom(clone).harness.engine;
	const adapter = harnessAdapter(harness);
	const blocker = launchBlocker(adapter, divergenceEscalationFeature);
	if (blocker) {
		daemonLog(
			`auto-update diverged in the clone ${clone}: no escalation spawned, ${blocker.replaceAll("\n", " ")}`,
		);
		throw new Error(blocker);
	}
	const prompt = divergencePrompt(clone, output);
	const id = allocateAndBind(
		ctx,
		clone,
		(sid, resolvedCwd) => ({
			...createSession(sid, { prompt, cwd: resolvedCwd ?? clone, harness }),
			divergenceEscalation: true,
		}),
		{ inPlace: true },
	);
	daemonLog(
		`auto-update diverged in the clone ${clone}: spawned ${adapter.label} escalation session ${id} to diagnose it`,
	);
	return id;
}
