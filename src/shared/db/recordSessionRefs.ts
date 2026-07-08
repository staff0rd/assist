import type { GitRef } from "../../commands/backlog/types";
import { resolveSessionItemId } from "../resolveSessionItemId";
import { closeDb, getDb } from "./getDb";
import { recordGitRef } from "./recordGitRef";

export async function recordSessionRefs(refs: GitRef[]): Promise<void> {
	const itemId = resolveSessionItemId();
	if (itemId === null || refs.length === 0) return;
	await persist(itemId, refs).catch(ignore);
	await closeDb().catch(ignore);
}

async function persist(itemId: number, refs: GitRef[]): Promise<void> {
	const db = await getDb();
	for (const ref of refs) {
		await recordGitRef(db, itemId, ref);
	}
}

function ignore(): void {}
