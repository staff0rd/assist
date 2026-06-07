import type * as net from "node:net";
import { createInterface } from "node:readline";
import type { SessionInfo } from "./createSession";

const STATUS_TIMEOUT_MS = 5_000;

type DaemonQueryResult = { pid?: number; sessions: SessionInfo[] };

// The daemon greets every new connection with a sessions message; ping is
// answered with a pong carrying the daemon's pid
export function queryDaemon(socket: net.Socket): Promise<DaemonQueryResult> {
	socket.write(`${JSON.stringify({ type: "ping" })}\n`);
	return new Promise((resolve) => {
		const result: DaemonQueryResult = { sessions: [] };
		const pending = new Set(["sessions", "pong"]);
		const timer = setTimeout(() => resolve(result), STATUS_TIMEOUT_MS);
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		lines.on("line", (line) => {
			applyLine(result, pending, line);
			if (pending.size === 0) {
				clearTimeout(timer);
				resolve(result);
			}
		});
	});
}

function applyLine(
	result: DaemonQueryResult,
	pending: Set<string>,
	line: string,
): void {
	try {
		const data = JSON.parse(line);
		if (data.type === "sessions") {
			result.sessions = data.sessions ?? [];
			pending.delete("sessions");
		} else if (data.type === "pong") {
			result.pid = data.pid;
			pending.delete("pong");
		}
	} catch {}
}
