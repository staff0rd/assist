import type { BacklogDb } from "./BacklogDb";
import { loadComments } from "./loadComments";
import { loadPlan } from "./loadPlan";
import type { BacklogFile, BacklogItem, BacklogStatus } from "./types";

type ItemRow = {
	id: number;
	type: string;
	name: string;
	description: string | null;
	acceptance_criteria: string;
	status: string;
	current_phase: number | null;
	origin: string;
};

async function loadLinks(
	db: BacklogDb,
	itemId: number,
): Promise<BacklogItem["links"]> {
	return db.all<NonNullable<BacklogItem["links"]>[number]>(
		'SELECT type, target_id as "targetId" FROM links WHERE item_id = ?',
		[itemId],
	);
}

async function rowToItem(db: BacklogDb, row: ItemRow): Promise<BacklogItem> {
	const comments = await loadComments(db, row.id);
	const links = await loadLinks(db, row.id);
	const plan = await loadPlan(db, row.id);

	const item: BacklogItem = {
		id: row.id,
		type: row.type as BacklogItem["type"],
		name: row.name,
		acceptanceCriteria: JSON.parse(row.acceptance_criteria),
		status: row.status as BacklogStatus,
		origin: row.origin,
	};
	if (row.description != null) item.description = row.description;
	if (row.current_phase != null) item.currentPhase = row.current_phase;
	if (comments.length > 0) item.comments = comments;
	if (links && links.length > 0) item.links = links;
	if (plan) item.plan = plan;

	return item;
}

/**
 * Load all backlog items. When `origin` is provided, only items tagged with that
 * origin are returned; when omitted, items across every repository are returned.
 */
export async function loadAllItems(
	db: BacklogDb,
	origin?: string,
): Promise<BacklogFile> {
	const rows = await db.all<ItemRow>(
		`SELECT id, type, name, description, acceptance_criteria, status, current_phase, origin
		 FROM items
		 WHERE (?::text IS NULL OR origin = ?)
		 ORDER BY id`,
		[origin ?? null, origin ?? null],
	);
	return Promise.all(rows.map((row) => rowToItem(db, row)));
}
