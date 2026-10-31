import {
	assistServerUrl,
	SERVER_URL_KEY,
} from "../sendToAssist/assistServerUrl";
import { browserApi } from "./browserApi";
import { runBrowserRequest } from "./runBrowserRequest";
import {
	BROWSER_LINK_ALARM,
	BROWSER_LINK_PATH,
	type BrowserLinkMessage,
	type BrowserRelayRequest,
} from "./types";

const RECONNECT_MS = 5_000;

let socket: WebSocket | undefined;
let opening: Promise<void> | undefined;

export function connectBrowserLink(): void {
	const api = browserApi();
	if (!api) return;
	api.alarms?.create(BROWSER_LINK_ALARM, { periodInMinutes: 0.5 });
	api.alarms?.onAlarm.addListener((alarm) => {
		if (alarm.name === BROWSER_LINK_ALARM) ensureSocket();
	});
	api.storage?.onChanged.addListener((changes) => {
		if (SERVER_URL_KEY in changes) socket?.close();
	});
	ensureSocket();
}

function ensureSocket(): void {
	if (opening || (socket && socket.readyState <= WebSocket.OPEN)) return;
	opening = openSocket().finally(() => {
		opening = undefined;
	});
}

async function openSocket(): Promise<void> {
	const server = await assistServerUrl();
	const ws = new WebSocket(
		`${server.replace(/^http/, "ws")}${BROWSER_LINK_PATH}`,
	);
	socket = ws;
	ws.addEventListener("open", () =>
		send(ws, {
			type: "hello",
			version: browserApi()?.runtime.getManifest().version ?? "unknown",
		}),
	);
	ws.addEventListener("message", (event) => void answer(ws, event.data));
	ws.addEventListener("close", () => {
		if (socket !== ws) return;
		socket = undefined;
		setTimeout(ensureSocket, RECONNECT_MS);
	});
}

async function answer(ws: WebSocket, data: unknown): Promise<void> {
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
	send(ws, { ...reply, type: "response", id: request.id });
}

function send(ws: WebSocket, message: BrowserLinkMessage): void {
	if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}
