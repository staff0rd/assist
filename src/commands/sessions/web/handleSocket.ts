import type { Socket } from "node:net";
import { createInterface } from "node:readline";
import type { WebSocket } from "ws";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { ensureDaemonRunning } from "../daemon/ensureDaemonRunning";

export type RelayContext = {
	serverCwd: string;
	repoCwd?: string;
};

const CWD_DEFAULTED_TYPES = new Set(["create", "create-run", "create-assist"]);

export function handleSocket(ws: WebSocket, ctx: RelayContext): void {
	const connection = openDaemonConnection(ws, ctx);
	connection.catch(() => {});

	ws.on("message", async (msg) => {
		const conn = await connection.catch(() => null);
		conn?.write(`${withDefaultCwd(msg.toString(), ctx.serverCwd)}\n`);
	});

	ws.on("close", () => {
		void connection.then((conn) => conn.destroy()).catch(() => {});
	});
}

async function openDaemonConnection(
	ws: WebSocket,
	ctx: RelayContext,
): Promise<Socket> {
	try {
		await ensureDaemonRunning("web socket connection");
		const conn = await connectToDaemon();
		relayDaemonLines(conn, ws, ctx.repoCwd);
		return conn;
	} catch (e) {
		closeWithError(ws, e);
		throw e;
	}
}

function relayDaemonLines(conn: Socket, ws: WebSocket, repoCwd?: string): void {
	const lines = createInterface({ input: conn });
	// readline re-emits the socket's 'error' (e.g. ECONNRESET on abrupt
	// disconnect) and crashes the process if unhandled
	lines.on("error", () => {});
	lines.on("line", (line) => {
		if (ws.readyState === ws.OPEN) ws.send(withRepoCwd(line, repoCwd));
	});
	conn.on("error", () => {});
	conn.on("close", () => ws.close());
}

function closeWithError(ws: WebSocket, e: unknown): void {
	if (ws.readyState !== ws.OPEN) return;
	ws.send(
		JSON.stringify({
			type: "error",
			message: `sessions daemon unavailable: ${e instanceof Error ? e.message : String(e)}`,
		}),
	);
	ws.close();
}

// Sessions are spawned by the daemon, whose own cwd is meaningless — default
// create requests to the web server's cwd.
function withDefaultCwd(raw: string, serverCwd: string): string {
	try {
		const data = JSON.parse(raw);
		if (!CWD_DEFAULTED_TYPES.has(data.type) || data.cwd) return raw;
		data.cwd = serverCwd;
		return JSON.stringify(data);
	} catch {
		return raw;
	}
}

// The repo the web server was started in is per-client context the daemon
// doesn't know about.
function withRepoCwd(line: string, repoCwd?: string): string {
	if (!repoCwd) return line;
	try {
		const data = JSON.parse(line);
		if (data.type !== "sessions" || data.cwd) return line;
		data.cwd = repoCwd;
		return JSON.stringify(data);
	} catch {
		return line;
	}
}
