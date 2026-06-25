import type * as net from "node:net";
import { createInterface } from "node:readline";
import { connectToDaemon } from "./connectToDaemon";
import { savePersistedSessions } from "./loadPersistedSessions";

const DRAIN_TIMEOUT_MS = 5_000;

export async function drainDaemon(): Promise<void> {
	let socket: net.Socket;
	try {
		socket = await connectToDaemon();
	} catch {
		/* why: no daemon owns sessions.json, so clear the file directly — otherwise
		 * the next daemon birth would restore the stale entries we meant to drop. */
		savePersistedSessions([]);
		console.log("Sessions daemon is not running; cleared persisted sessions");
		return;
	}

	const count = await requestDrain(socket);
	socket.destroy();
	console.log(`Drained ${count} session(s)`);
}

function requestDrain(socket: net.Socket): Promise<number> {
	socket.write(`${JSON.stringify({ type: "drain" })}\n`);
	return new Promise((resolve) => {
		const timer = setTimeout(() => resolve(0), DRAIN_TIMEOUT_MS);
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		// why: the daemon greets the connection with other messages first, so read until the drained ack
		lines.on("line", (line) => {
			try {
				const data = JSON.parse(line);
				if (data.type === "drained") {
					clearTimeout(timer);
					resolve(data.count ?? 0);
				}
			} catch {}
		});
	});
}
