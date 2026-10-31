import { eq } from "drizzle-orm";
import { getDb } from "../../../shared/db/getDb";
import { items } from "../../../shared/db/schema";
import { replacePlan } from "../updatePlan/replacePlan";
import type { ProposedItem } from "./proposedItemSchema";

const BUG_DEFAULT_PLAN = [
	{ name: "Fix", tasks: ["Fix the bug"], manualChecks: [] },
];

export async function reviseProposedItem(
	itemId: number,
	item: ProposedItem,
): Promise<boolean> {
	const orm = await getDb();
	const [existing] = await orm
		.select({ currentPhase: items.currentPhase })
		.from(items)
		.where(eq(items.id, itemId));
	if (!existing) return false;

	await orm
		.update(items)
		.set({
			type: item.type,
			name: item.name,
			description: item.description || null,
			acceptanceCriteria: JSON.stringify(item.acceptanceCriteria),
		})
		.where(eq(items.id, itemId));

	const phases =
		item.phases.length > 0 || item.type !== "bug"
			? item.phases
			: BUG_DEFAULT_PLAN;
	await replacePlan(orm, itemId, phases, existing.currentPhase ?? undefined);
	return true;
}
