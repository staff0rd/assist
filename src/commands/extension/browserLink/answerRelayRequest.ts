import { browserApi } from "./browserApi";
import { installAvailableUpdate } from "./installAvailableUpdate";
import { runBrowserRequest } from "./runBrowserRequest";
import type { BrowserRelayRequest } from "./types";
import { sendLinkMessage } from "./sendLinkMessage";

export async function answerRelayRequest(
	ws: WebSocket,
	data: unknown,
): Promise<void> {
	let request: BrowserRelayRequest;
	try {
		request = JSON.parse(String(data)) as BrowserRelayRequest;
	} catch {
		return;
	}
	if (request.type !== "request") return;
	const reply = await runBrowserRequest(request).catch((error: unknown) => ({
		ok: false as const,
		error: error instanceof Error ? error.message : String(error),
	}));
	sendLinkMessage(ws, { ...reply, type: "response", id: request.id });
	const api = browserApi();
	if (api && request.op === "update") installAvailableUpdate(api, reply);
}
