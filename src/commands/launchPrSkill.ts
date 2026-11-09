import chalk from "chalk";
import { awaitHarness, HARNESS_SPAWN_FAILED } from "../shared/awaitHarness";
import { emitActivity } from "../shared/emitActivity";
import { harnessAdapter } from "../shared/harnessAdapters/harnessAdapter";
import { launchBlocker } from "../shared/harnessAdapters/launchBlocker";
import { preassignedId } from "../shared/harnessAdapters/preassignedId";
import type { HarnessFeature } from "../shared/harnessAdapters/types";
import type { HarnessKind } from "../shared/harnesses";
import { resumeNudge } from "./backlog/resumeNudge";
import { checkoutPr } from "./review/checkoutPr";

type PrSkillLaunch = {
	feature: HarnessFeature;
	skill: string;
	args?: string;
	number?: string;
	harness?: HarnessKind;
	resumeSessionId?: string;
};

export async function launchPrSkill({
	feature,
	skill,
	args,
	number,
	harness,
	resumeSessionId,
}: PrSkillLaunch): Promise<void> {
	const adapter = harnessAdapter(harness);
	const blocker = launchBlocker(adapter, feature, resumeSessionId);
	if (blocker) {
		console.error(chalk.red(blocker));
		process.exitCode = 1;
		return;
	}
	if (number && !resumeSessionId) await checkoutPr(number);
	const conversationId = resumeSessionId ?? preassignedId(adapter);
	emitActivity({
		kind: "command",
		name: skill,
		...adapter.activityIdentity(conversationId, resumeSessionId),
	});
	const cwd = process.cwd();
	const { done } = resumeSessionId
		? adapter.resume(resumeSessionId, resumeNudge(), { cwd })
		: adapter.launchSkill(skill, args, { conversationId, cwd });
	const exitCode = await awaitHarness(done, `/${skill}`, adapter.label);
	if (exitCode === HARNESS_SPAWN_FAILED) process.exitCode = 1;
}
