import { buildPhasePrompt } from "./buildPhasePrompt";
import { launchPhaseHarness } from "./launchPhaseHarness";
import { resumeNudge } from "./resumeNudge";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "./types";

export function launchPhaseSession(
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
			: buildPhasePrompt(item, phaseNumber, phase, harness),
		resumeSessionId
			? phaseOptions
			: { ...phaseOptions, sessionId: claudeSessionId },
		phaseLabel,
		harness,
	);
}
