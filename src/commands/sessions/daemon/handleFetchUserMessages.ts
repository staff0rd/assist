import { extractUserMessages } from "../shared/extractUserMessages";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { resolveTranscriptPath } from "./resolveTranscriptPath";
import type { Session } from "./createSession";
import type { SessionManager } from "./SessionManager";

function findSession(manager: SessionManager, id: string): Session | undefined {
	let found: Session | undefined;
	manager.update((sessions) => {
		found = sessions.get(id);
		return false;
	});
	return found;
}

export async function handleFetchUserMessages(
	client: SessionClient,
	manager: SessionManager,
	data: Record<string, unknown>,
): Promise<void> {
	const sessionId = data.sessionId as string;
	const session = findSession(manager, sessionId);
	const filePath = session ? await resolveTranscriptPath(session) : null;
	const entries = filePath
		? await readTranscriptTail(filePath, Number.POSITIVE_INFINITY)
		: [];
	const messages = extractUserMessages(entries);
	daemonLog(
		`session ${sessionId} user messages: ${messages.length} from ${filePath ?? "no transcript"}`,
	);
	sendTo(client, { type: "user-messages", sessionId, messages });
}
