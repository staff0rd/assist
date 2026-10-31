import {
	assistServerUrl,
	SERVER_URL_KEY,
} from "../sendToAssist/assistServerUrl";
import { browserApi } from "./browserApi";
import { BROWSER_LINK_ALARM, BROWSER_LINK_PATH } from "./types";
import { sendLinkMessage } from "./sendLinkMessage";
import { answerRelayRequest } from "./answerRelayRequest";

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
	api.runtime.onUpdateAvailable?.addListener(() => api.runtime.reload?.());
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
		sendLinkMessage(ws, {
			type: "hello",
			version: browserApi()?.runtime.getManifest().version ?? "unknown",
		}),
	);
	ws.addEventListener(
		"message",
		(event) => void answerRelayRequest(ws, event.data),
	);
	ws.addEventListener("close", () => {
		if (socket !== ws) return;
		socket = undefined;
		setTimeout(ensureSocket, RECONNECT_MS);
	});
}
