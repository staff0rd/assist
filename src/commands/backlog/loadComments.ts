import type { BacklogDb } from "./BacklogDb";
import type { BacklogComment } from "./types";

export async function loadComments(
	db: BacklogDb,
	itemId: number,
): Promise<BacklogComment[]> {
	const rows = await db.all<{
		id: number;
		text: string;
		phase: number | null;
		timestamp: string;
		type: BacklogComment["type"];
	}>(
		"SELECT id, text, phase, timestamp, type FROM comments WHERE item_id = ? ORDER BY idx",
		[itemId],
	);
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
