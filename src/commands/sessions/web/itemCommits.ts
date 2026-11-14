import { findItemBySessionId } from "../../../shared/db/findItemBySessionId";
import { getDb } from "../../../shared/db/getDb";
import {
	type CommitRef,
	listCommitRefs,
} from "../../../shared/db/listCommitRefs";
import { loadConfig } from "../../../shared/loadConfig";
import { withTimeout } from "../../../shared/withTimeout";

const LOOKUP_TIMEOUT_MS = 3_000;

async function lookupItemCommits(sessionId: string): Promise<CommitRef[]> {
	const db = await getDb();
	const itemId = await findItemBySessionId(db, sessionId);
	if (itemId === undefined) return [];
	return listCommitRefs(db, itemId);
}

export async function itemCommits(sessionId: string): Promise<CommitRef[]> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url)
			return [];
		return await withTimeout(
			lookupItemCommits(sessionId),
			LOOKUP_TIMEOUT_MS,
			"item commits",
		);
	} catch {
		return [];
	}
}
