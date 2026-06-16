import type { Socket } from "node:net";
import { autoHealWindowsDaemon } from "./autoHealWindowsDaemon";
import { broadcast, type SessionClient, sendTo } from "./broadcast";
import type { SessionInfo } from "./createSession";
import { daemonLog } from "./daemonLog";
import { defaultConnect } from "./defaultConnect";
import { discoverWindowsSessions } from "./discoverWindowsSessions";
import { forwardWindowsCreate } from "./forwardWindowsCreate";
import { handleInbound } from "./handleInbound";
import { healWindowsDaemon } from "./healWindowsDaemon";
import { isWindowsCreate, isWindowsIo } from "./isWindowsCreate";
import { stripWindowsSessionId } from "./toWindowsSessionId";
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
	// why: heal runs once per proxy lifetime; if WSL is the older side, updating Windows can't close the gap, so a repeat mismatch must not loop
	private healAttempted = false;
	private healing = false;

	constructor(
		clients: Set<SessionClient>,
		onSessionsChanged: () => void,
		// Injectable for tests; defaults to launch-then-connect over TCP.
		connect: () => Promise<Socket> = defaultConnect,
		// why: injectable so tests don't spawn pwsh; defaults to update + restart
		private readonly heal: () => Promise<void> = healWindowsDaemon,
	) {
		this.state = createState(
			(msg) => broadcast(clients, msg),
			onSessionsChanged,
			(version) => void this.handleVersionMismatch(version),
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

	discover(): Promise<void> {
		return discoverWindowsSessions(this.conn);
	}

	replayScrollback(client: SessionClient): void {
		replayScrollback(this.state, client);
	}

	// Returns true when the message targets Windows: a create/resume in a
	// windows-origin cwd is forwarded, as is I/O for a namespaced session id.
	route(client: SessionClient, data: Msg): boolean {
		if (isWindowsCreate(data)) {
			void forwardWindowsCreate(this.conn, this.state, client, data);
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

	private async handleVersionMismatch(version: string): Promise<void> {
		if (this.healing || this.healAttempted) return;
		this.healing = true;
		this.healAttempted = true;
		try {
			await autoHealWindowsDaemon(this.conn, this.state, this.heal, version);
		} finally {
			this.healing = false;
		}
	}

	private handleClose(): void {
		daemonLog("windows proxy: connection to windows daemon closed");
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
