import { randomUUID } from "node:crypto";
import { persistPhaseSession } from "./persistPhaseSession";
import { persistPhaseSessionId } from "./persistPhaseSessionId";
import { reportPhaseActivity } from "./reportPhaseActivity";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "./types";
import { verifyPhaseResume } from "./verifyPhaseResume";

export async function preparePhaseSession(
	item: BacklogItem,
	phase: PlanPhase,
	phaseIndex: number,
	phaseNumber: number,
	totalPhases: number,
	phaseLabel: string,
	spawnOptions?: BacklogRunOptions,
): Promise<{ claudeSessionId: string } | undefined> {
	const resumeSessionId = spawnOptions?.resumeSessionId;
	const claudeSessionId = resumeSessionId ?? randomUUID();
	if (
		resumeSessionId &&
		!(await verifyPhaseResume(
			item.id,
			resumeSessionId,
			phaseLabel,
			spawnOptions?.harness,
		))
	) {
		return undefined;
	}
	reportPhaseActivity(
		item,
		phaseNumber,
		totalPhases,
		phase,
		claudeSessionId,
		spawnOptions?.harness,
		resumeSessionId,
	);
	if (!resumeSessionId) {
		await persistPhaseSessionId(item.id, phaseIndex, claudeSessionId);
	}
	await persistPhaseSession(item.id, phaseIndex, claudeSessionId);
	return { claudeSessionId };
}
