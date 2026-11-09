import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import { sessionFeature } from "../../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../../shared/harnessAdapters/launchBlocker";
import { daemonLog } from "../daemonLog";
import { joinableStream } from "./joinableStream";
import type { TreeSpawnContext } from "./spawnInTree";
import { type AddAgentRequest, spawnIntoStream } from "./spawnIntoStream";

export function addAgentToStream(
	ctx: TreeSpawnContext,
	targetId: string,
	request: AddAgentRequest,
): { sessionId: string } | { reason: string } {
	const joinable = joinableStream(ctx.sessions, targetId);
	if ("reason" in joinable) {
		daemonLog(
			`create: cannot add an agent to session ${targetId}: ${joinable.reason}`,
		);
		return joinable;
	}
	const harness = request.harness ?? joinable.session.harness;
	const blocker = launchBlocker(harnessAdapter(harness), sessionFeature);
	if (blocker) {
		daemonLog(
			`create: cannot add an agent to session ${targetId}: ${blocker.replaceAll("\n", " ")}`,
		);
		return { reason: blocker };
	}
	return {
		sessionId: spawnIntoStream(ctx, joinable.session, { ...request, harness }),
	};
}
