import { getDb } from "../../shared/db/getDb";
import { insertItem } from "./insertItem";
import { type NewItemPhase, insertNewItemPhases } from "./insertNewItemPhases";
import { insertPhaseAt } from "./insertPhaseAt";
import { getOrigin } from "./shared";
import type { BacklogType } from "./types";

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

	if (fields.phases?.length) {
		await insertNewItemPhases(orm, id, fields.phases);
	} else if (fields.type === "bug") {
		await insertPhaseAt(orm, id, 0, "Fix", ["Fix the bug"], null, undefined);
	}

	return id;
}
