import type { BacklogDb } from "./openDb";
import type { BacklogComment } from "./types";

export function loadComments(db: BacklogDb, itemId: number): BacklogComment[] {
	const rows = db
		.prepare(
			"SELECT id, text, phase, timestamp, type FROM comments WHERE item_id = ? ORDER BY idx",
		)
		.all(itemId) as Array<{
		id: number;
		text: string;
		phase: number | null;
		timestamp: string;
		type: BacklogComment["type"];
	}>;
	return rows.map((r) => {
		const c: BacklogComment = {
			id: r.id,
			text: r.text,
			timestamp: r.timestamp,
			type: r.type,
		};
		if (r.phase != null) c.phase = r.phase;
		return c;
	});
}
