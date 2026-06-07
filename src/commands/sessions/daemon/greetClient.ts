import { type SessionClient, sendTo } from "./broadcast";
import type { Session, SessionInfo } from "./createSession";
import { replayScrollback } from "./replayScrollback";

export function greetClient(
	client: SessionClient,
	sessions: Map<string, Session>,
	list: () => SessionInfo[],
): void {
	sendTo(client, { type: "sessions", sessions: list() });
	replayScrollback(sessions, client);
}
