import type { Db } from "../../shared/db/Db";
import { recordGitRef } from "../../shared/db/recordGitRef";

export async function recordDocsUnlock(orm: Db, itemId: number): Promise<void> {
	await recordGitRef(orm, itemId, {
		kind: "docs-unlock",
		ref: "approved",
		title: "Docs pages and screenshots unlocked by PIN",
	});
}
