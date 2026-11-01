import type { Activity } from "../../shared/emitActivity";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import type { BacklogItem } from "./types";

export function backlogPhaseActivity(
	item: Pick<BacklogItem, "id" | "name">,
	phaseNumber: number,
	totalPhases: number,
	phaseName: string,
): Omit<Activity, "startedAt"> {
	const isReviewPhase = phaseNumber >= totalPhases;
	return {
		kind: "backlog",
		itemId: item.id,
		itemName: item.name,
		phase: phaseNumber,
		phaseName: isReviewPhase ? REVIEW_PHASE_NAME : phaseName,
		totalPhases,
	};
}
