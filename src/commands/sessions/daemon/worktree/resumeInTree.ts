import { existsSync } from "node:fs";
import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import { conversationResumeFeature } from "../../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../../shared/harnessAdapters/launchBlocker";
import type { HarnessKind } from "../../../../shared/harnesses";
import { daemonLog } from "../daemonLog";
import { resumeSession } from "../resumeSession";
import type { TreeSpawnContext } from "./allocateAndBind";
import { bindResumedWorktree } from "./bindNewWorktree";
import { resumeInReplacementTree } from "./resumeInReplacementTree";

export function resumeInTree(
	ctx: TreeSpawnContext,
	sessionId: string,
	cwd: string,
	name: string | undefined,
	harness?: HarnessKind,
): string {
	if (!existsSync(cwd))
		return resumeInReplacementTree(ctx, sessionId, cwd, name, harness);
	const blocker = launchBlocker(
		harnessAdapter(harness),
		conversationResumeFeature,
	);
	if (blocker) {
		daemonLog(`resume ${sessionId} refused: ${blocker.replaceAll("\n", " ")}`);
		throw new Error(blocker);
	}
	const id = ctx.spawnWith((sid) =>
		resumeSession(sid, sessionId, cwd, name, undefined, harness),
	);
	daemonLog(`session ${id} resuming ${sessionId} in ${cwd}`);
	bindResumedWorktree(ctx.sessions.get(id), cwd, ctx.notify);
	return id;
}
