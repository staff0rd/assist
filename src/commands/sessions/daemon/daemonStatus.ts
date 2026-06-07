import { existsSync, readFileSync } from "node:fs";
import type * as net from "node:net";
import { createInterface } from "node:readline";
import { connectToDaemon } from "./connectToDaemon";
import type { SessionInfo } from "./createSession";
import { daemonPaths } from "./daemonPaths";

const STATUS_TIMEOUT_MS = 5_000;

export async function daemonStatus(): Promise<void> {
	let socket: net.Socket;
	try {
		socket = await connectToDaemon();
	} catch {
		console.log("Sessions daemon is not running");
		return;
	}

	const sessions = await readSessionList(socket);
	socket.destroy();

	console.log(`Sessions daemon is running${describePid()}`);
	if (sessions.length === 0) {
		console.log("No sessions");
		return;
	}
	for (const session of sessions) {
		const restored = session.restored === false ? " (not restored)" : "";
		console.log(`  [${session.status}] ${session.name}${restored}`);
	}
}

function describePid(): string {
	if (!existsSync(daemonPaths.pid)) return "";
	return ` (PID ${readFileSync(daemonPaths.pid, "utf-8").trim()})`;
}

// The daemon greets every new connection with a sessions message
function readSessionList(socket: net.Socket): Promise<SessionInfo[]> {
	return new Promise((resolve) => {
		const timer = setTimeout(() => resolve([]), STATUS_TIMEOUT_MS);
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		lines.on("line", (line) => {
			try {
				const data = JSON.parse(line);
				if (data.type !== "sessions") return;
				clearTimeout(timer);
				resolve(data.sessions ?? []);
			} catch {}
		});
	});
}
