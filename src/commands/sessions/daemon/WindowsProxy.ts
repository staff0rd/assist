import type { Socket } from "node:net";
import { broadcast, type SessionClient, sendTo } from "./broadcast";
import type { SessionInfo } from "./createSession";
import { daemonLog } from "./daemonLog";
import { defaultConnect } from "./defaultConnect";
import { discoverWindowsSessions } from "./discoverWindowsSessions";
import { forwardWindowsCreate } from "./forwardWindowsCreate";
import { handleInbound } from "./handleInbound";
import { handleWindowsClose } from "./handleWindowsClose";
import { healWindowsDaemon } from "./healWindowsDaemon";
import { isWindowsCreate, isWindowsIo } from "./isWindowsCreate";
import { stripWindowsSessionId } from "./toWindowsSessionId";
import { WindowsConnection } from "./WindowsConnection";
import {
	createState,
	replayScrollback,
	type WindowsProxyState,
} from "./WindowsProxyState";
import { WindowsVersionHealer } from "./WindowsVersionHealer";

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
	private readonly healer: WindowsVersionHealer;
	// why: on the Windows host the proxy would dial its own bridge, self-feeding a log loop and connect churn.
	private readonly enabled = process.platform !== "win32";

	constructor(
		clients: Set<SessionClient>,
		onSessionsChanged: () => void,
		// Injectable for tests; defaults to launch-then-connect over TCP.
		connect: () => Promise<Socket> = defaultConnect,
		// why: injectable so tests don't spawn pwsh; defaults to update + restart
		heal: () => Promise<void> = healWindowsDaemon,
		// why: injectable so tests don't wait the full window for a create to time out
		createTimeoutMs?: number,
	) {
		this.state = createState(
			(msg) => broadcast(clients, msg),
			onSessionsChanged,
			(version) => void this.healer.onMismatch(version),
			createTimeoutMs,
		);
		this.conn = new WindowsConnection({
			connect,
			onLine: (line) => handleInbound(this.state, line),
			onClose: () => handleWindowsClose(this.state),
		});
		this.healer = new WindowsVersionHealer(this.conn, this.state, heal);
	}

	sessions(): SessionInfo[] {
		return this.state.windowsSessions;
	}

	discover(): Promise<void> {
		if (!this.enabled || this.healer.blocked) return Promise.resolve();
		return discoverWindowsSessions(this.conn);
	}

	replayScrollback(client: SessionClient): void {
		replayScrollback(this.state, client);
	}

	// Returns true when the message targets Windows: a create/resume in a
	// windows-origin cwd is forwarded, as is I/O for a namespaced session id.
	route(client: SessionClient, data: Msg): boolean {
		if (!this.enabled) return false;
		if (isWindowsCreate(data)) return this.routeCreate(client, data);
		if (isWindowsIo(data)) return this.routeIo(data);
		return false;
	}

	private routeCreate(client: SessionClient, data: Msg): boolean {
		if (this.healer.blocked) {
			daemonLog(
				`windows proxy: refusing ${data.type} (cwd=${data.cwd}); windows host version incompatible`,
			);
			sendTo(client, this.healer.refusal());
		} else void forwardWindowsCreate(this.conn, this.state, client, data);
		return true;
	}

	private routeIo(data: Msg): boolean {
		const sessionId = stripWindowsSessionId(data.sessionId as string);
		this.conn.trySend({ ...data, sessionId });
		return true;
	}

	dispose(): void {
		this.conn.dispose();
	}
}
