import type { BacklogDatabase } from "../../shared/db/Db";
import { comments, links, planPhases, planTasks } from "../../shared/db/schema";
import type { BacklogItem } from "./types";

async function insertComments(
	db: BacklogDatabase,
	item: BacklogItem,
): Promise<void> {
	if (!item.comments?.length) return;
	// `id` is left undefined for comments without one, so Drizzle inserts DEFAULT
	// and the global identity sequence assigns a fresh id.
	await db.insert(comments).values(
		item.comments.map((c, i) => ({
			id: c.id,
			itemId: item.id,
			idx: i,
			text: c.text,
			phase: c.phase ?? null,
			timestamp: c.timestamp,
			type: c.type,
		})),
	);
}

async function insertLinks(
	db: BacklogDatabase,
	item: BacklogItem,
): Promise<void> {
	if (!item.links?.length) return;
	await db.insert(links).values(
		item.links.map((l) => ({
			itemId: item.id,
			type: l.type,
			targetId: l.targetId,
		})),
	);
}

async function insertPlan(
	db: BacklogDatabase,
	item: BacklogItem,
): Promise<void> {
	if (!item.plan?.length) return;
	await db.insert(planPhases).values(
		item.plan.map((phase, pi) => ({
			itemId: item.id,
			idx: pi,
			name: phase.name,
			manualChecks: phase.manualChecks
				? JSON.stringify(phase.manualChecks)
				: null,
		})),
	);
	const tasks = item.plan.flatMap((phase, pi) =>
		phase.tasks.map((task, ti) => ({
			itemId: item.id,
			phaseIdx: pi,
			idx: ti,
			task: task.task,
		})),
	);
	if (tasks.length) await db.insert(planTasks).values(tasks);
}

export async function insertItemRelations(
	db: BacklogDatabase,
	item: BacklogItem,
): Promise<void> {
	await insertComments(db, item);
	await insertLinks(db, item);
	await insertPlan(db, item);
}
