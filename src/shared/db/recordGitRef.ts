import type { GitRef } from "../../commands/backlog/types";
import type { Db } from "./Db";
import { itemGitRefs } from "./schema";

export async function recordGitRef(
	db: Db,
	itemId: number,
	ref: GitRef,
): Promise<void> {
	await db
		.insert(itemGitRefs)
		.values({
			itemId,
			kind: ref.kind,
			ref: ref.ref,
			title: ref.title ?? null,
			url: ref.url ?? null,
			state: ref.state ?? null,
		})
		.onConflictDoUpdate({
			target: [itemGitRefs.itemId, itemGitRefs.kind, itemGitRefs.ref],
			set: {
				title: ref.title ?? null,
				url: ref.url ?? null,
				state: ref.state ?? null,
			},
		});
}
