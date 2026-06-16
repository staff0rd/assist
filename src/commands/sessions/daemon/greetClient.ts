import { type SessionClient, sendTo } from "./broadcast";
import type { Session, SessionInfo } from "./createSession";
import { replayScrollback } from "./replayScrollback";

export function greetClient(
	client: SessionClient,
	sessions: Map<string, Session>,
	list: () => SessionInfo[],
	windowsProxy: {
		replayScrollback: (client: SessionClient) => void;
		discover: () => Promise<void>;
	},
): void {
	sendTo(client, { type: "sessions", sessions: list() });
	replayScrollback(sessions, client);
	windowsProxy.replayScrollback(client);
	// why: surface already-running Windows sessions on connect, not only after a create
	void windowsProxy.discover();
}
