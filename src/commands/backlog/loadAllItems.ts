import { loadPlan } from "./loadPlan";
import type { BacklogDb } from "./openDb";
import type {
	BacklogComment,
	BacklogFile,
	BacklogItem,
	BacklogStatus,
} from "./types";

type ItemRow = {
	id: number;
	type: string;
	name: string;
	description: string | null;
	acceptance_criteria: string;
	status: string;
	current_phase: number | null;
};

function loadComments(db: BacklogDb, itemId: number): BacklogComment[] {
	return db
		.prepare(
			"SELECT text, phase, timestamp, type FROM comments WHERE item_id = ? ORDER BY idx",
		)
		.all(itemId) as BacklogComment[];
}

function loadLinks(db: BacklogDb, itemId: number): BacklogItem["links"] {
	return db
		.prepare("SELECT type, target_id as targetId FROM links WHERE item_id = ?")
		.all(itemId) as BacklogItem["links"];
}

function rowToItem(db: BacklogDb, row: ItemRow): BacklogItem {
	const comments = loadComments(db, row.id);
	const links = loadLinks(db, row.id);
	const plan = loadPlan(db, row.id);

	const item: BacklogItem = {
		id: row.id,
		type: row.type as BacklogItem["type"],
		name: row.name,
		acceptanceCriteria: JSON.parse(row.acceptance_criteria),
		status: row.status as BacklogStatus,
	};
	if (row.description != null) item.description = row.description;
	if (row.current_phase != null) item.currentPhase = row.current_phase;
	if (comments.length > 0) item.comments = comments;
	if (links && links.length > 0) item.links = links;
	if (plan) item.plan = plan;

	return item;
}

export function loadAllItems(db: BacklogDb): BacklogFile {
	const rows = db.prepare("SELECT * FROM items ORDER BY id").all() as ItemRow[];
	return rows.map((row) => rowToItem(db, row));
}
