import { extractLastAssistantMessage } from "../shared/extractLastAssistantMessage";
import { extractLastUserMessage } from "../shared/extractLastUserMessage";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

type MessageField = "lastUserMessage" | "lastAssistantMessage";

function update(
	session: Session,
	field: MessageField,
	message: string | undefined,
	label: string,
): boolean {
	if (message === session[field]) return false;
	session[field] = message;
	daemonLog(
		`session ${session.id} last ${label} message: ${JSON.stringify(message?.slice(0, 120) ?? null)}`,
	);
	return true;
}

export function updateLastMessages(
	session: Session,
	entries: Record<string, unknown>[],
	notify?: () => void,
): void {
	const user = update(
		session,
		"lastUserMessage",
		extractLastUserMessage(entries),
		"user",
	);
	const assistant = update(
		session,
		"lastAssistantMessage",
		extractLastAssistantMessage(entries),
		"assistant",
	);
	if (user || assistant) notify?.();
}
