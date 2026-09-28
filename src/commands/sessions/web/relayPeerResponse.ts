import type { IncomingMessage, ServerResponse } from "node:http";
import { isQuietPoll } from "./isQuietPoll";

export function relayPeerResponse(
	peer: IncomingMessage,
	res: ServerResponse,
	pathname: string,
	log: (outcome: string) => void,
	done: () => void,
): void {
	const status = peer.statusCode ?? 502;
	if (!isQuietPoll(pathname, status)) log(String(status));
	res.writeHead(status, peer.headers);
	peer.pipe(res);
	peer.on("end", done);
	peer.on("error", done);
}
