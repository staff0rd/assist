import type { Socket } from "node:net";
import { broadcast, type SessionClient, sendTo } from "./broadcast";
import { connectToWindowsDaemon } from "./connectToWindowsDaemon";
import type { SessionInfo } from "./createSession";
import { ensureWindowsDaemonRunning } from "./ensureWindowsDaemonRunning";
import { handleInbound } from "./handleInbound";
import { shouldProxyToWindows } from "./isWindowsCwd";
import {
	isWindowsSessionId,
	stripWindowsSessionId,
} from "./toWindowsSessionId";
import { WindowsConnection } from "./WindowsConnection";
import {
	createState,
	replayScrollback,
	resetState,
	type WindowsProxyState,
} from "./WindowsProxyState";

type Msg = Record<string, unknown>;

/**
 * The WSL daemon's client of the native Windows daemon. It launches the Windows
 * daemon on demand, connects over TCP, performs a version handshake, and proxies
 * interactive Windows sessions: create/resume and I/O flow out to the Windows
 * PTY; output, scrollback, and session state flow back (ids namespaced) to merge
 * into the WSL UI alongside local sessions.
 */
export class WindowsProxy {
	private readonly state: WindowsProxyState;
	private readonly conn: WindowsConnection;

	constructor(
		clients: Set<SessionClient>,
		onSessionsChanged: () => void,
		// Injectable for tests; defaults to launch-then-connect over TCP.
		connect: () => Promise<Socket> = defaultConnect,
	) {
		this.state = createState(
			(msg) => broadcast(clients, msg),
			onSessionsChanged,
		);
		this.conn = new WindowsConnection({
			connect,
			onLine: (line) => handleInbound(this.state, line),
			onClose: () => this.handleClose(),
		});
	}

	sessions(): SessionInfo[] {
		return this.state.windowsSessions;
	}

	replayScrollback(client: SessionClient): void {
		replayScrollback(this.state, client);
	}

	// Returns true when the message targets Windows: a create/resume in a
	// windows-origin cwd is forwarded, as is I/O for a namespaced session id.
	route(client: SessionClient, data: Msg): boolean {
		if (isWindowsCreate(data)) {
			void this.forwardCreate(client, data);
			return true;
		}
		if (isWindowsIo(data)) {
			const sessionId = stripWindowsSessionId(data.sessionId as string);
			this.conn.trySend({ ...data, sessionId });
			return true;
		}
		return false;
	}

	dispose(): void {
		this.conn.dispose();
	}

	private async forwardCreate(client: SessionClient, data: Msg): Promise<void> {
		try {
			await this.conn.ensure();
			this.state.pendingCreators.push(client);
			this.conn.write(data);
		} catch (e) {
			sendTo(client, {
				type: "error",
				message: `Windows session unavailable: ${errorText(e)}`,
			});
		}
	}

	private handleClose(): void {
		for (const client of this.state.pendingCreators)
			sendTo(client, {
				type: "error",
				message: "Windows daemon connection closed",
			});
		resetState(this.state);
		// Drop the Windows cards from every UI by rebroadcasting the merged list.
		this.state.onSessionsChanged();
	}
}

function isWindowsCreate(data: Msg): boolean {
	return typeof data.cwd === "string" && shouldProxyToWindows(data.cwd);
}

function isWindowsIo(data: Msg): boolean {
	return (
		typeof data.sessionId === "string" && isWindowsSessionId(data.sessionId)
	);
}

async function defaultConnect(): Promise<Socket> {
	await ensureWindowsDaemonRunning();
	return connectToWindowsDaemon();
}

function errorText(e: unknown): string {
	return e instanceof Error ? e.message : String(e);
}
