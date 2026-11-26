import { and, eq } from "drizzle-orm";
import { getDb } from "../../../shared/db/getDb";
import { comments, items } from "../../../shared/db/schema";
import { replacePlan } from "../updatePlan/replacePlan";
import type { ProposedItem } from "./proposedItemSchema";

const BUG_DEFAULT_PLAN = [
	{ name: "Fix", tasks: ["Fix the bug"], manualChecks: [] },
];

export async function reviseProposedItem(
	itemId: number,
	item: ProposedItem,
): Promise<"revised" | "missing" | "started"> {
	const orm = await getDb();
	const [existing] = await orm
		.select({ currentPhase: items.currentPhase, status: items.status })
		.from(items)
		.where(eq(items.id, itemId));
	if (!existing) return "missing";
	if (existing.status !== "todo") return "started";

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
	await orm
		.delete(comments)
		.where(and(eq(comments.itemId, itemId), eq(comments.type, "why")));
	return "revised";
}
