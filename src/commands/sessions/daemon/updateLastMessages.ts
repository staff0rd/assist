import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { lastMessageText } from "../shared/lastMessageText";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

type MessageField = "lastUserMessage" | "lastAssistantMessage";

const USER_MAX_LENGTH = 2048;
const ASSISTANT_MAX_LENGTH = 500;

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

/* why: a `!` command never reaches the transcript until it is sent with the
 * next message, so while one is running or held it is the last thing typed. */
function lastShellPrompt(session: Session): string | undefined {
	const row = session.sdkShell?.at(-1);
	return row && `! ${row.command}`;
}

export function updateLastMessages(
	session: Session,
	events: ConversationEvent[],
	notify?: () => void,
): void {
	const user = update(
		session,
		"lastUserMessage",
		lastShellPrompt(session) ??
			lastMessageText(events, "user", USER_MAX_LENGTH),
		"user",
	);
	const assistant = update(
		session,
		"lastAssistantMessage",
		lastMessageText(events, "assistant", ASSISTANT_MAX_LENGTH),
		"assistant",
	);
	if (user || assistant) notify?.();
}
