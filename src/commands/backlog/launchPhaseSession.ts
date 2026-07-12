import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { buildPhasePrompt } from "./buildPhasePrompt";
import { launchPhaseClaude } from "./launchPhaseClaude";
import { resumeNudge } from "./resumeNudge";
import type { BacklogItem, PlanPhase } from "./types";

export function launchPhaseSession(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
	phaseLabel: string,
	claudeSessionId: string,
	spawnOptions?: SpawnClaudeOptions,
): Promise<number | null> {
	const resumeSessionId = spawnOptions?.resumeSessionId;
	return launchPhaseClaude(
		resumeSessionId
			? resumeNudge()
			: buildPhasePrompt(item, phaseNumber, phase),
		resumeSessionId
			? (spawnOptions ?? {})
			: { ...spawnOptions, sessionId: claudeSessionId },
		phaseLabel,
	);
}
