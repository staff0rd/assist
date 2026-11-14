import { findSession } from "./findSession";
import { readFile } from "node:fs/promises";
import { conversationOf } from "../shared/conversationOf";
import {
	type TranscriptMessage,
	transcriptMessages,
} from "../shared/transcriptMessages";
import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { readTranscriptEchoes } from "./readTranscriptEchoes";
import { resolveTranscriptPath } from "./resolveTranscriptPath";
import type { SessionManager } from "./SessionManager";

async function readMessages(session: Session): Promise<TranscriptMessage[]> {
	const conversation = conversationOf(session);
	const filePath = conversation ? await resolveTranscriptPath(session) : null;
	if (!conversation || !filePath) return [];
	try {
		return transcriptMessages(
			conversation.reader,
			(await readFile(filePath, "utf8")).split("\n"),
			await readTranscriptEchoes(conversation.id),
		);
	} catch {
		return [];
	}
}

export async function handleFetchSessionTranscript(
	client: SessionClient,
	manager: SessionManager,
	data: Record<string, unknown>,
): Promise<void> {
	const sessionId = data.sessionId as string;
	const session = findSession(manager, sessionId);
	const messages = session ? await readMessages(session) : [];
	daemonLog(
		`session ${sessionId} live transcript: ${session ? `${messages.length} messages` : "unknown session"}`,
	);
	sendTo(client, { type: "session-transcript", sessionId, messages });
}
