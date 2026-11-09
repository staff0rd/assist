import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { emitSessionOutput } from "./emitSessionOutput";

export function announceFreshRestart(
	session: Session,
	clients: Set<SessionClient>,
	reason: string,
): void {
	emitSessionOutput(
		session,
		clients,
		`\r\n\x1b[33mRestarted without the previous conversation: ${reason}\x1b[0m\r\n\r\n`,
	);
}
