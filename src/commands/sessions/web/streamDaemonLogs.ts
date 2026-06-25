import type { Socket } from "node:net";
import { createInterface } from "node:readline";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { ensureDaemonRunning } from "../daemon/ensureDaemonRunning";

const RECONNECT_MS = 3_000;

// why: a dedicated, always-on daemon connection (separate from the per-browser
// relay) that subscribes to daemonLog output and echoes it to the web server's
// stdout, so project-switch 'View logs' (assist.log) shows daemon operations
// alongside the web-server lifecycle lines.
export function streamDaemonLogs(): void {
	void connect();
}

async function connect(): Promise<void> {
	try {
		await ensureDaemonRunning("web log stream");
		const socket = await connectToDaemon();
		wire(socket);
		socket.write(
			`${JSON.stringify({ type: "subscribe-logs", replay: false })}\n`,
		);
	} catch {
		scheduleReconnect();
	}
}

function wire(socket: Socket): void {
	const lines = createInterface({ input: socket });
	// readline re-emits the socket's 'error' (e.g. ECONNRESET) and crashes the
	// process if unhandled
	lines.on("error", () => {});
	lines.on("line", emit);
	socket.on("error", () => {});
	socket.on("close", scheduleReconnect);
}

function emit(line: string): void {
	try {
		const data = JSON.parse(line);
		if (data.type === "log" && typeof data.line === "string")
			console.log(data.line);
	} catch {}
}

function scheduleReconnect(): void {
	// why: unref so a pending reconnect timer never keeps the process alive on its own
	setTimeout(() => void connect(), RECONNECT_MS).unref();
}
