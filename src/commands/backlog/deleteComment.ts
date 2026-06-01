import type { BacklogDb } from "./BacklogDb";

type DeleteCommentResult = "deleted" | "not-found" | "is-summary";

export async function deleteComment(
	db: BacklogDb,
	itemId: number,
	commentId: number,
): Promise<DeleteCommentResult> {
	const row = await db.get<{ type: string }>(
		"SELECT type FROM comments WHERE id = ? AND item_id = ?",
		[commentId, itemId],
	);

	if (!row) return "not-found";
	if (row.type === "summary") return "is-summary";

	await db.run("DELETE FROM comments WHERE id = ? AND item_id = ?", [
		commentId,
		itemId,
	]);
	return "deleted";
}
