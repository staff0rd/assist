import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";

const LINK_REPLY_TIMEOUT_MS = 8_000;

export function requestViaLink<T>(
	req: IncomingMessage,
	type: string,
): Promise<T | undefined> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const node = url.searchParams.get("node") ?? undefined;
	return requestDaemonReply<T>(
		{ type, node, requestId: randomUUID() },
		type,
		LINK_REPLY_TIMEOUT_MS,
	);
}
