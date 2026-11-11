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
	model?: string;
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
	if (resumeSessionId)
		return adapter.resume(resumeSessionId, resumeNudge(), { cwd });
	const [skill, ...inline] = slashCommand.split(" ");
	const args = [...inline, request.description?.trim()]
		.filter(Boolean)
		.join(" ");
	return adapter.launchSkill(skill, args || undefined, {
		conversationId,
		cwd,
		model: request.model,
	});
}
