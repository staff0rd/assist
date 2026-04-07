import type { BacklogDb } from "./openDb";

type DeleteCommentResult = "deleted" | "not-found" | "is-summary";

export function deleteComment(
	db: BacklogDb,
	itemId: number,
	commentId: number,
): DeleteCommentResult {
	const row = db
		.prepare("SELECT type FROM comments WHERE id = ? AND item_id = ?")
		.get(commentId, itemId) as { type: string } | undefined;

	if (!row) return "not-found";
	if (row.type === "summary") return "is-summary";

	db.prepare("DELETE FROM comments WHERE id = ? AND item_id = ?").run(
		commentId,
		itemId,
	);
	return "deleted";
}
