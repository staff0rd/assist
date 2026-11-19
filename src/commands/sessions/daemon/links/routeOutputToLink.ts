import type { SessionClient } from "../broadcast";
import type { NodeLinks } from "./NodeLinks";
import { routeToLinkedSession } from "./routeToLinkedSession";

export function routeOutputToLink(
	client: SessionClient,
	links: NodeLinks,
	data: Record<string, unknown>,
): Record<string, unknown> | undefined {
	return routeToLinkedSession(client, links, data, (sessionId, reason) => ({
		type: "session-output",
		sessionId,
		error: `Cannot read session ${sessionId}: ${reason}`,
	}));
}
