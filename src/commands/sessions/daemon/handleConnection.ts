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
		const { deliveryAck, ...message } = data;
		try {
			dispatchMessage(client, manager, message);
			if (deliveryAck) sendTo(client, { type: "ack" });
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			daemonLog(`${message.type} failed: ${reason}`);
			sendTo(client, {
				type: "error",
				message: `${message.type} failed: ${reason}`,
			});
			if (deliveryAck)
				sendTo(client, {
					type: "ack",
					error: `${message.type} failed: ${reason}`,
				});
		}
	});

	socket.on("error", () => {});
	socket.on("close", () => manager.removeClient(client));
}
