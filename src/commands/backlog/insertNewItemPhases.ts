import type { Db } from "../../shared/db/Db";
import { toStoredDependsOn } from "./dependsOn/toStoredDependsOn";
import { foldLastManualChecks } from "./foldLastManualChecks";
import { insertPhaseAt } from "./insertPhaseAt";
import { insertReviewPhase } from "./insertReviewPhase";
import { serializeManualChecks } from "./serializeManualChecks";

export type NewItemPhase = {
	name: string;
	tasks: string[];
	manualChecks?: string[];
	dependsOn?: number[];
};

export async function insertNewItemPhases(
	orm: Db,
	itemId: number,
	authored: NewItemPhase[],
): Promise<void> {
	const { phases, reviewChecks } = foldLastManualChecks(authored);
	for (const [idx, phase] of phases.entries()) {
		await insertPhaseAt(
			orm,
			itemId,
			idx,
			phase.name,
			phase.tasks,
			serializeManualChecks(phase.manualChecks),
			undefined,
			toStoredDependsOn(phase.dependsOn, idx),
		);
	}
	if (reviewChecks.length > 0) {
		await insertReviewPhase(orm, itemId, phases.length, reviewChecks);
	}
}
