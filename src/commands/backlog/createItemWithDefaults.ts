import { getDb } from "../../shared/db/getDb";
import { insertItem } from "./insertItem";
import { insertPhaseAt } from "./insertPhaseAt";
import { toStoredDependsOn } from "./dependsOn/toStoredDependsOn";
import { serializeManualChecks } from "./serializeManualChecks";
import { getOrigin } from "./shared";
import type { BacklogType } from "./types";

type NewItemPhase = {
	name: string;
	tasks: string[];
	manualChecks?: string[];
	dependsOn?: number[];
};

type NewItemFields = {
	type: BacklogType;
	name: string;
	description?: string;
	acceptanceCriteria: string[];
	phases?: NewItemPhase[];
};

export async function createItemWithDefaults(
	fields: NewItemFields,
): Promise<number> {
	const orm = await getDb();
	const id = await insertItem(
		orm,
		{
			type: fields.type,
			name: fields.name,
			description: fields.description || undefined,
			acceptanceCriteria: fields.acceptanceCriteria,
			status: "todo",
			starred: false,
		},
		getOrigin(),
	);

	const phases = fields.phases ?? [];
	if (phases.length > 0) {
		for (const [idx, phase] of phases.entries()) {
			await insertPhaseAt(
				orm,
				id,
				idx,
				phase.name,
				phase.tasks,
				serializeManualChecks(phase.manualChecks),
				undefined,
				toStoredDependsOn(phase.dependsOn, idx),
			);
		}
	} else if (fields.type === "bug") {
		await insertPhaseAt(orm, id, 0, "Fix", ["Fix the bug"], null, undefined);
	}

	return id;
}
