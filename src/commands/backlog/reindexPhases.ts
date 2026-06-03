import { and, asc, count, eq } from "drizzle-orm";
import type { BacklogDatabase } from "./BacklogOrm";
import { items, planPhases, planTasks } from "./backlogSchema";
import type { BacklogItem } from "./types";

/** Renumber an item's phases to be contiguous from 0 after a deletion. */
export async function reindexPhases(
	db: BacklogDatabase,
	itemId: number,
): Promise<void> {
	const remaining = await db
		.select({ idx: planPhases.idx })
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId))
		.orderBy(asc(planPhases.idx));

	for (let i = 0; i < remaining.length; i++) {
		const oldIdx = remaining[i].idx;
		if (oldIdx === i) continue;
		await db
			.update(planTasks)
			.set({ phaseIdx: i })
			.where(and(eq(planTasks.itemId, itemId), eq(planTasks.phaseIdx, oldIdx)));
		await db
			.update(planPhases)
			.set({ idx: i })
			.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, oldIdx)));
	}
}

/** Shift currentPhase to stay valid after the phase at `removedIdx` is removed. */
export async function adjustCurrentPhase(
	db: BacklogDatabase,
	item: BacklogItem,
	removedIdx: number,
): Promise<void> {
	const currentPhase = item.currentPhase;
	if (currentPhase === undefined) return;
	const currentIdx = currentPhase - 1;

	if (removedIdx < currentIdx) {
		await db
			.update(items)
			.set({ currentPhase: currentPhase - 1 })
			.where(eq(items.id, item.id));
		return;
	}
	if (removedIdx !== currentIdx) return;

	const [row] = await db
		.select({ cnt: count() })
		.from(planPhases)
		.where(eq(planPhases.itemId, item.id));
	const cnt = row?.cnt ?? 0;
	await db
		.update(items)
		.set({ currentPhase: cnt === 0 ? null : Math.min(currentPhase, cnt) })
		.where(eq(items.id, item.id));
}
