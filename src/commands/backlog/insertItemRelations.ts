import type { BacklogDatabase } from "../../shared/db/Db";
import { comments, itemSubtasks, links } from "../../shared/db/schema";
import type { BacklogItem } from "./types";
import { insertPlan } from "./insertPlan";

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

async function insertSubtasks(
	db: BacklogDatabase,
	item: BacklogItem,
): Promise<void> {
	if (!item.subtasks?.length) return;
	await db.insert(itemSubtasks).values(
		item.subtasks.map((s, i) => ({
			itemId: item.id,
			idx: i,
			title: s.title,
			description: s.description ?? null,
			status: s.status,
		})),
	);
}

export async function insertItemRelations(
	db: BacklogDatabase,
	item: BacklogItem,
): Promise<void> {
	await insertComments(db, item);
	await insertSubtasks(db, item);
	await insertLinks(db, item);
	await insertPlan(db, item);
}
