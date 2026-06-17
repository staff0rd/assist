import { and, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { comments } from "../../shared/db/schema";

type DeleteCommentResult = "deleted" | "not-found" | "is-summary";

export async function deleteComment(
	orm: Db,
	itemId: number,
	commentId: number,
): Promise<DeleteCommentResult> {
	const [row] = await orm
		.select({ type: comments.type })
		.from(comments)
		.where(and(eq(comments.id, commentId), eq(comments.itemId, itemId)));

	if (!row) return "not-found";
	if (row.type === "summary") return "is-summary";

	await orm
		.delete(comments)
		.where(and(eq(comments.id, commentId), eq(comments.itemId, itemId)));
	return "deleted";
}
