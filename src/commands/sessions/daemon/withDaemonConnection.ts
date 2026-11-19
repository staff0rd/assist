import type * as net from "node:net";
import { createInterface, type Interface } from "node:readline";
import { connectToDaemon } from "./connectToDaemon";

export async function withDaemonConnection<T>(
	use: (socket: net.Socket, lines: Interface) => Promise<T>,
): Promise<T> {
	const socket = await connectToDaemon().catch(() => {
		throw new Error("No sessions daemon is running");
	});
	try {
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		return await use(socket, lines);
	} finally {
		socket.destroy();
	}
}
