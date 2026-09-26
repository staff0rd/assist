import { formatItemId } from "../../formatItemId";
import { withCwd } from "./withCwd";

export async function deleteComment(
	itemId: number,
	commentId: number,
	cwd?: string,
	node?: string,
): Promise<void> {
	const res = await fetch(
		withCwd(
			`/api/items/${formatItemId(itemId)}/comments/${commentId}`,
			cwd,
			node,
		),
		{ method: "DELETE" },
	);
	if (!res.ok) {
		const body = (await res.json().catch(() => undefined)) as
			| { error?: string }
			| undefined;
		throw new Error(body?.error ?? `Failed to delete comment (${res.status})`);
	}
}
