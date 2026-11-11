import { randomUUID } from "node:crypto";
import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { NodeLinks } from "./NodeLinks";
import { splitNodeSessionId } from "./splitNodeSessionId";

function unavailable(links: NodeLinks, node: string): string | undefined {
	const status = links.nodes().links.find((link) => link.name === node);
	if (!status)
		return `${node} is not a linked node (link state: unknown); see assist sessions nodes`;
	if (status.state === "connected") return undefined;
	const detail = status.error ? `: ${status.error}` : "";
	return `${node} link is ${status.state}${detail}; run assist sessions nodes doctor ${node}`;
}

export function routeOutputToLink(
	client: SessionClient,
	links: NodeLinks,
	data: Record<string, unknown>,
): Record<string, unknown> | undefined {
	const sessionId = data.sessionId;
	const split =
		typeof sessionId === "string" ? splitNodeSessionId(sessionId) : undefined;
	if (!split) return data;
	if (split.node === links.localNode()) return { ...data, sessionId: split.id };
	const reason = unavailable(links, split.node);
	if (reason) {
		daemonLog(`output requested: id=${sessionId} ${reason}`);
		sendTo(client, {
			type: "session-output",
			sessionId,
			error: `Cannot read session ${sessionId}: ${reason}`,
		});
		return undefined;
	}
	links.route(client, { ...data, requestId: data.requestId ?? randomUUID() });
	return undefined;
}
