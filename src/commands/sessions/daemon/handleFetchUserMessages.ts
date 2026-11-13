import { findSession } from "./findSession";
import { conversationOf } from "../shared/conversationOf";
import { userMessageTexts } from "../shared/userMessageTexts";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { resolveTranscriptPath } from "./resolveTranscriptPath";
import type { SessionManager } from "./SessionManager";

export async function handleFetchUserMessages(
	client: SessionClient,
	manager: SessionManager,
	data: Record<string, unknown>,
): Promise<void> {
	const sessionId = data.sessionId as string;
	const session = findSession(manager, sessionId);
	const reader = session ? conversationOf(session)?.reader : undefined;
	const filePath =
		session && reader ? await resolveTranscriptPath(session) : null;
	const entries =
		reader && filePath
			? await readTranscriptTail(filePath, Number.POSITIVE_INFINITY)
			: [];
	const messages = reader ? userMessageTexts(reader.events(entries)) : [];
	daemonLog(
		`session ${sessionId} user messages: ${messages.length} from ${filePath ?? "no transcript"}`,
	);
	sendTo(client, { type: "user-messages", sessionId, messages });
}
