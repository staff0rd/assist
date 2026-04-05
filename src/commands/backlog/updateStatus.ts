import type { BacklogDb } from "./openDb";
import type { BacklogStatus } from "./types";

export function updateStatus(
	db: BacklogDb,
	id: number,
	status: BacklogStatus,
): boolean {
	const result = db
		.prepare("UPDATE items SET status = ? WHERE id = ?")
		.run(status, id);
	return result.changes > 0;
}
