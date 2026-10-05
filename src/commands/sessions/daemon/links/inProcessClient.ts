import type { SessionClient } from "../broadcast";
import { PROTOCOL_VERSION } from "../buildHello";
import type { SessionManager } from "../SessionManager";
import type { LinkHandlers } from "./LinkTransport";

export type InProcessPeer = {
	name: string;
	manager: SessionManager;
	reportVersion?: string;
	helloExtra?: Record<string, unknown>;
};

export function inProcessClient(peer: InProcessPeer, handlers: LinkHandlers) {
	const conn = { open: true };
	const deliver = (data: string) => {
		let msg = JSON.parse(data);
		if (msg.type === "hello" && peer.reportVersion) {
			msg.version = peer.reportVersion;
			msg.protocol = PROTOCOL_VERSION - 1;
		}
		if (msg.type === "hello") msg = { ...msg, ...peer.helloExtra };
		if (conn.open) handlers.onLine(JSON.stringify(msg));
	};
	const client: SessionClient = {
		send: (data) => queueMicrotask(() => deliver(data)),
	};
	peer.manager.addClient(client);
	const close = () => {
		conn.open = false;
		peer.manager.removeClient(client);
	};
	return { client, conn, close };
}
