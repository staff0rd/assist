import type { Socket } from "node:net";
import { createInterface } from "node:readline";
import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { dispatchMessage } from "./dispatchMessage";
import type { SessionManager } from "./SessionManager";

export function handleConnection(
	socket: Socket,
	manager: SessionManager,
): void {
	const client: SessionClient = {
		send: (data) => {
			if (socket.writable) socket.write(`${data}\n`);
		},
		onClose: (listener) => socket.on("close", listener),
	};
	manager.addClient(client);
	manager.clients.greet(client);

	const lines = createInterface({ input: socket });
	// readline re-emits the socket's 'error' (e.g. ECONNRESET on abrupt
	// disconnect) and crashes the process if unhandled
	lines.on("error", () => {});
	lines.on("line", (line) => {
		let data: Record<string, unknown>;
		try {
			data = JSON.parse(line);
		} catch {
			return;
		}
		try {
			dispatchMessage(client, manager, data);
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			daemonLog(`${data.type} failed: ${reason}`);
			sendTo(client, {
				type: "error",
				message: `${data.type} failed: ${reason}`,
			});
		}
	});

	socket.on("error", () => {});
	socket.on("close", () => manager.removeClient(client));
}
