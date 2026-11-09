import type { Socket } from "node:net";
import type { WebSocket } from "ws";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { ensureDaemonRunning } from "../daemon/ensureDaemonRunning";
import { resolveLinkTarget } from "../daemon/links/resolveLinkTarget";
import { resolveNodeName } from "../shared/resolveNodeName";
import { forEachCompleteLine } from "./forEachCompleteLine";
import { withRepoCwd } from "./withRepoCwd";

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
	} catch (error) {
		closeWithError(ws, error);
		throw error;
	}
}

function relayDaemonLines(conn: Socket, ws: WebSocket, repoCwd?: string): void {
	forEachCompleteLine(
		conn,
		(line) => {
			if (ws.readyState === ws.OPEN) ws.send(withRepoCwd(line, repoCwd));
		},
		(partial) =>
			console.log(
				`ws relay: dropped truncated daemon message (${partial.length} chars) after the daemon connection closed`,
			),
	);
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
		if (targetsLinkedNode(data)) return raw;
		data.cwd = serverCwd;
		return JSON.stringify(data);
	} catch {
		return raw;
	}
}

function targetsLinkedNode(data: Record<string, unknown>): boolean {
	return (
		resolveLinkTarget(data, resolveNodeName(), () => true).kind !== "local"
	);
}
