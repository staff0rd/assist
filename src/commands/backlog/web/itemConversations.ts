import type { HistoricalSession } from "../../sessions/shared/parseSessionFile";
import { lookupSessionsById } from "../../sessions/shared/lookupSessionsById";
import type { BacklogItem, Conversation } from "../types";

export async function itemConversations(
	item: BacklogItem,
): Promise<Conversation[]> {
	const byId = new Map<string, Conversation>();
	for (const ref of item.gitRefs ?? []) {
		if (ref.kind !== "session" || byId.has(ref.ref)) continue;
		byId.set(ref.ref, {
			sessionId: ref.ref,
			...(ref.title && { title: ref.title }),
			...(ref.createdAt && { createdAt: ref.createdAt }),
		});
	}
	for (const session of item.phaseSessions ?? []) {
		const { claudeSessionId: sessionId, createdAt } = session;
		if (byId.has(sessionId)) continue;
		byId.set(sessionId, { sessionId, ...(createdAt && { createdAt }) });
	}
	if (byId.size === 0) return [];

	const transcripts = await lookupSessionsById([...byId.keys()]);
	return [...byId.values()]
		.map((conversation) =>
			withTranscript(conversation, transcripts.get(conversation.sessionId)),
		)
		.sort(newestFirst);
}

function withTranscript(
	conversation: Conversation,
	transcript: HistoricalSession | undefined,
): Conversation {
	if (!transcript) return conversation;
	return {
		...conversation,
		...(transcript.cwd && { cwd: transcript.cwd }),
		...(transcript.harness && { harness: transcript.harness }),
		title: conversation.title ?? transcript.name,
		createdAt: conversation.createdAt ?? transcript.timestamp,
	};
}

function sortKey(conversation: Conversation): number {
	const parsed = Date.parse(conversation.createdAt ?? "");
	return Number.isNaN(parsed) ? 0 : parsed;
}

function newestFirst(a: Conversation, b: Conversation): number {
	return sortKey(b) - sortKey(a);
}
