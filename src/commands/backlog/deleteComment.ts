import { and, eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { comments } from "./backlogSchema";

type DeleteCommentResult = "deleted" | "not-found" | "is-summary";

export async function deleteComment(
	orm: BacklogOrm,
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
