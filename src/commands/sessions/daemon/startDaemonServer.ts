import { unlinkSync } from "node:fs";
import * as net from "node:net";
import { isDaemonRunning } from "./connectToDaemon";
import { daemonLog } from "./daemonLog";
import { daemonPaths } from "./daemonPaths";
import { exitAfterFlush } from "./exitAfterFlush";
import { handleConnection } from "./handleConnection";
import { onListening } from "./onListening";
import type { SessionManager } from "./SessionManager";
import { describeWedgedHolder } from "./describeWedgedHolder";

export async function startDaemonServer(
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): Promise<void> {
	const server = net.createServer((socket) =>
		handleConnection(socket, manager),
	);
	let retried = false;
	server.on("error", (e: NodeJS.ErrnoException) => {
		if (e.code !== "EADDRINUSE" || retried) {
			daemonLog(`server error: ${e.message}; exiting`);
			process.exit(1);
		}
		retried = true;
		void recoverFromAddrInUse(server, manager, checkAutoExit);
	});
	// Sessions are restored only after the socket is bound, so a daemon that
	// loses the startup race never resumes a duplicate copy of them
	listenWithSingleOnListening(server, manager, checkAutoExit);
}

function listenWithSingleOnListening(
	server: net.Server,
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): void {
	server.removeAllListeners("listening");
	server.listen(daemonPaths.socket, () => onListening(manager, checkAutoExit));
}

// The socket path is taken: either a live daemon owns it (this process lost
// the startup race) or a crashed daemon left a stale file behind. Never
// unlink without first confirming nothing answers on it.
async function recoverFromAddrInUse(
	server: net.Server,
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): Promise<void> {
	if (await isDaemonRunning()) {
		daemonLog("another daemon owns the socket; exiting");
		process.exit(1);
	}
	if (process.platform === "win32") {
		daemonLog(
			`${daemonPaths.socket} is bound but not answering: ${describeWedgedHolder()}; a named pipe cannot be removed, so exiting instead of retrying the bind`,
		);
		exitAfterFlush(1);
		return;
	}
	daemonLog("removing stale socket left by a crashed daemon");
	try {
		unlinkSync(daemonPaths.socket);
	} catch {}
	listenWithSingleOnListening(server, manager, checkAutoExit);
}
