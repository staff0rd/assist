import type { BrowserLinkMessage } from "./types";

export function sendLinkMessage(
	ws: WebSocket,
	message: BrowserLinkMessage,
): void {
	if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}
