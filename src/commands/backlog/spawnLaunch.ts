import { preassignedId } from "../../shared/harnessAdapters/preassignedId";
import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import type { SpawnResult } from "../../shared/spawnInherit";
import { reportLaunchActivity } from "./reportLaunchActivity";
import { resumeNudge } from "./resumeNudge";

type LaunchRequest = {
	description?: string;
	itemId?: number;
	itemName?: string;
	resumeSessionId?: string;
};

export function spawnLaunch(
	adapter: HarnessAdapter,
	slashCommand: string,
	request: LaunchRequest,
): SpawnResult {
	const { resumeSessionId } = request;
	const conversationId = resumeSessionId ?? preassignedId(adapter);
	reportLaunchActivity(
		slashCommand,
		adapter.activityIdentity(conversationId, resumeSessionId),
		request,
	);
	const cwd = process.cwd();
	return resumeSessionId
		? adapter.resume(resumeSessionId, resumeNudge(), { cwd })
		: adapter.launchSkill(slashCommand, request.description, {
				conversationId,
				cwd,
			});
}
