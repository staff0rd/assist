import type { BacklogDb } from "./BacklogDb";
import type { BacklogStatus } from "./types";

export async function updateStatus(
	db: BacklogDb,
	id: number,
	status: BacklogStatus,
): Promise<boolean> {
	const result = await db.run("UPDATE items SET status = ? WHERE id = ?", [
		status,
		id,
	]);
	return result.changes > 0;
}
