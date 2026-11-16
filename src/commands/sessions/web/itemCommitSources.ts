import { findItemBySessionId } from "../../../shared/db/findItemBySessionId";
import { getDb } from "../../../shared/db/getDb";
import {
	type CommitRef,
	listCommitRefs,
} from "../../../shared/db/listCommitRefs";
import { listItemConversationIds } from "../../../shared/db/listItemConversationIds";
import { loadConfig } from "../../../shared/loadConfig";
import { withTimeout } from "../../../shared/withTimeout";

type ItemCommitSources = {
	commits: CommitRef[];
	conversationIds: string[];
};

const LOOKUP_TIMEOUT_MS = 3_000;

const NONE: ItemCommitSources = { commits: [], conversationIds: [] };

async function lookupItemCommitSources(
	sessionId: string,
): Promise<ItemCommitSources> {
	const db = await getDb();
	const itemId = await findItemBySessionId(db, sessionId);
	if (itemId === undefined) return NONE;
	return {
		commits: await listCommitRefs(db, itemId),
		conversationIds: await listItemConversationIds(db, itemId),
	};
}

export async function itemCommitSources(
	sessionId: string,
): Promise<ItemCommitSources> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url)
			return NONE;
		return await withTimeout(
			lookupItemCommitSources(sessionId),
			LOOKUP_TIMEOUT_MS,
			"item commits",
		);
	} catch {
		return NONE;
	}
}
