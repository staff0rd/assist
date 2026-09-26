import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import type { NodeLinks } from "./links/NodeLinks";
import { replayScrollback } from "./replayScrollback";

export function greetClient(
	client: SessionClient,
	sessions: Map<string, Session>,
	links: NodeLinks,
): void {
	replayScrollback(sessions, client);
	links.replayScrollback(client);
	links.sendNodes(client);
}
