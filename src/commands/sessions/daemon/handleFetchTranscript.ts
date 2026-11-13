import { randomUUID } from "node:crypto";
import { parseTranscript } from "../shared/parseTranscript";
import { type SessionClient, sendTo } from "./broadcast";
import { toNodeSessionId } from "./links/splitNodeSessionId";
import { type Msg, routed } from "./routed";
import type { SessionManager } from "./SessionManager";

function readLocalTranscript(
	client: SessionClient,
	_manager: SessionManager,
	data: Msg,
): void {
	const sessionId = data.sessionId as string;
	parseTranscript(sessionId).then((messages) =>
		sendTo(client, {
			type: "transcript",
			sessionId,
			messages,
			requestId: data.requestId,
		}),
	);
}

const routeOrReadLocal = routed(readLocalTranscript);

// why: history ids are bare, so the node rides alongside and is folded into a
// node-prefixed id only for routing; the peer's reply keeps the bare id
export function handleFetchTranscript(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	const { node, sessionId } = data;
	if (
		typeof node !== "string" ||
		!node ||
		node === manager.links.localNode() ||
		typeof sessionId !== "string"
	)
		return readLocalTranscript(client, manager, data);
	routeOrReadLocal(client, manager, {
		...data,
		sessionId: toNodeSessionId(node, sessionId),
		requestId: data.requestId ?? randomUUID(),
	});
}
