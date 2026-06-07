import type * as net from "node:net";
import { connectToDaemon } from "./connectToDaemon";
import { listDaemonPids } from "./listDaemonPids";
import { queryDaemon } from "./queryDaemon";
import { reportStolenSocket } from "./reportStolenSocket";

export async function daemonStatus(): Promise<void> {
	let socket: net.Socket;
	try {
		socket = await connectToDaemon();
	} catch {
		console.log("Sessions daemon is not running");
		// Anything still alive cannot be reached via the socket — all strays
		reportStrays(listDaemonPids());
		return;
	}

	const { pid, sessions } = await queryDaemon(socket);
	socket.destroy();

	console.log(`Sessions daemon is running${pid ? ` (PID ${pid})` : ""}`);
	reportStolenSocket(pid);
	reportStrays(listDaemonPids().filter((p) => p !== pid));
	if (sessions.length === 0) {
		console.log("No sessions");
		return;
	}
	for (const session of sessions) {
		const restored = session.restored === false ? " (not restored)" : "";
		console.log(`  [${session.status}] ${session.name}${restored}`);
	}
}

function reportStrays(pids: number[]): void {
	if (pids.length === 0) return;
	console.error(
		`Warning: stray daemon process(es) detected: ${pids.join(", ")}`,
	);
}
