import type { Socket } from "node:net";
import { createInterface } from "node:readline";
import { type SessionClient, sendTo } from "./broadcast";
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
		} catch (e) {
			sendTo(client, {
				type: "error",
				message: `${data.type} failed: ${e instanceof Error ? e.message : String(e)}`,
			});
		}
	});

	socket.on("error", () => {});
	socket.on("close", () => manager.removeClient(client));
}
