import {
	request as httpRequest,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import { request as httpsRequest } from "node:https";
import { respondJson } from "../../../shared/web";
import { newTraceId, TRACE_HEADER } from "../shared/newTraceId";
import { resolveNodeName } from "../shared/resolveNodeName";
import { boundUpstream } from "./boundUpstream";
import { relayPeerResponse } from "./relayPeerResponse";

const LINKED_FROM_HEADER = "x-assist-linked-from";

export function forwardToPeer(
	req: IncomingMessage,
	res: ServerResponse,
	node: string,
	url: URL,
): Promise<void> {
	const started = Date.now();
	const traceId = newTraceId();
	const label = `link ${node} http: ${req.method} ${url.pathname} trace=${traceId}`;
	const log = (outcome: string) =>
		console.log(`${label} -> ${outcome} (${Date.now() - started}ms)`);
	const send = url.protocol === "https:" ? httpsRequest : httpRequest;
	return new Promise((resolve) => {
		const upstream = send(
			url,
			{
				method: req.method,
				headers: {
					...req.headers,
					host: url.host,
					[LINKED_FROM_HEADER]: resolveNodeName(),
					[TRACE_HEADER]: traceId,
				},
			},
			(peer) => relayPeerResponse(peer, res, url.pathname, log, resolve),
		);
		boundUpstream(upstream, res);
		upstream.on("error", (error) => {
			log(`failed: ${error.message}`);
			if (res.headersSent) res.destroy();
			else
				respondJson(res, 502, {
					error: `${node} unreachable: ${error.message}`,
				});
			resolve();
		});
		req.pipe(upstream);
	});
}
