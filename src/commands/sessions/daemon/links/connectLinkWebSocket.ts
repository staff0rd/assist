import WebSocket from "ws";
import type { LinkHandlers, LinkSocket } from "./LinkTransport";

const HANDSHAKE_TIMEOUT_MS = 5_000;

function linkWebSocketUrl(url: string): string {
	const target = new URL("/ws", url);
	target.protocol = target.protocol === "https:" ? "wss:" : "ws:";
	return target.toString();
}

export function connectLinkWebSocket(
	url: string,
	handlers: LinkHandlers,
): Promise<LinkSocket> {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(linkWebSocketUrl(url), {
			handshakeTimeout: HANDSHAKE_TIMEOUT_MS,
		});
		let open = false;
		ws.on("open", () => {
			open = true;
			resolve({
				send: (line) => {
					if (ws.readyState !== WebSocket.OPEN) return false;
					ws.send(line);
					return true;
				},
				close: () => ws.close(),
			});
		});
		ws.on("message", (data) => handlers.onLine(data.toString()));
		ws.on("error", (error) => {
			if (!open) reject(error);
		});
		ws.on("close", (code, reason) => {
			const detail = `code ${code}${reason.length ? ` ${reason.toString()}` : ""}`;
			if (open) handlers.onClose(detail);
			else reject(new Error(`closed before open (${detail})`));
		});
	});
}
