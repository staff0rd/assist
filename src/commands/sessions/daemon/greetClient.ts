import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { replayScrollback } from "./replayScrollback";

export function greetClient(
	client: SessionClient,
	sessions: Map<string, Session>,
	windowsProxy: {
		replayScrollback: (client: SessionClient) => void;
		discover: () => Promise<void>;
	},
): void {
	replayScrollback(sessions, client);
	windowsProxy.replayScrollback(client);
	// why: surface already-running Windows sessions on connect, not only after a create
	void windowsProxy.discover();
}
