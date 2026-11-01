import type { Db } from "../../shared/db/Db";
import { recordGitRef } from "../../shared/db/recordGitRef";
import { phaseUnlockRef } from "../backlog/phaseUnlockRef";

export async function recordDocsUnlock(
	orm: Db,
	itemId: number,
	phase: number,
): Promise<void> {
	await recordGitRef(orm, itemId, {
		kind: "docs-unlock",
		ref: phaseUnlockRef(phase),
		title: `Docs pages and screenshots unlocked by PIN for phase ${phase}`,
	});
}
