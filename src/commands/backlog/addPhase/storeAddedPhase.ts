import type { Db } from "../../../shared/db/Db";
import { foldStoredManualChecks } from "../foldStoredManualChecks";
import { insertPhaseAt } from "../insertPhaseAt";
import { serializeManualChecks } from "../serializeManualChecks";

type AddedPhase = {
	name: string;
	tasks: string[];
	manualChecks?: string[];
	dependsOn: number[] | null;
};

export async function storeAddedPhase(
	orm: Db,
	itemId: number,
	phaseIdx: number,
	phase: AddedPhase,
	currentPhase: number | undefined,
): Promise<void> {
	await insertPhaseAt(
		orm,
		itemId,
		phaseIdx,
		phase.name,
		phase.tasks,
		serializeManualChecks(phase.manualChecks),
		currentPhase,
		phase.dependsOn,
	);
	await foldStoredManualChecks(orm, itemId);
}
