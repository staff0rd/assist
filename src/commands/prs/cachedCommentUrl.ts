import { loadCommentsCache } from "./loadCommentsCache";
import type { ThreadTarget } from "./threadTarget";

export function cachedCommentUrl(
	{ org, repo, prNumber }: Pick<ThreadTarget, "org" | "repo" | "prNumber">,
	commentId: number,
): string | undefined {
	const comment = loadCommentsCache(org, repo, prNumber)?.comments.find(
		(c) => c.type === "line" && c.id === commentId,
	);
	return comment?.html_url || undefined;
}
