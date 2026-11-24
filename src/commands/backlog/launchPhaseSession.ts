import { buildPhasePrompt } from "./buildPhasePrompt";
import { fetchAutopilotRunContract } from "./fetchAutopilotRunContract";
import { launchPhaseHarness } from "./launchPhaseHarness";
import { resumeNudge } from "./resumeNudge";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "./types";

async function phasePrompt(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
	harness: BacklogRunOptions["harness"],
): Promise<string> {
	const prompt = buildPhasePrompt(item, phaseNumber, phase, harness);
	const contract = await fetchAutopilotRunContract(item.id);
	return contract ? `${prompt}\n\n${contract}` : prompt;
}

export async function launchPhaseSession(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
	phaseLabel: string,
	claudeSessionId: string,
	spawnOptions?: BacklogRunOptions,
): Promise<number | null> {
	const harness = spawnOptions?.harness;
	const { harness: _harness, ...phaseOptions } = spawnOptions ?? {};
	const resumeSessionId = phaseOptions.resumeSessionId;
	return launchPhaseHarness(
		resumeSessionId
			? resumeNudge()
			: await phasePrompt(item, phaseNumber, phase, harness),
		resumeSessionId
			? phaseOptions
			: { ...phaseOptions, sessionId: claudeSessionId },
		phaseLabel,
		harness,
	);
}
