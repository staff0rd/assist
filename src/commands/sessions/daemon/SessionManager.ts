// assist-maintainability-override: 65
import { ActiveSelection } from "./ActiveSelection";
import type { SessionClient } from "./broadcast";
import { broadcastSessions } from "./broadcastSessions";
import { ClientHub, persistUsagePeak } from "./ClientHub";
import {
	type AssistSessionMeta,
	createAssistSession,
} from "./createAssistSession";
import { dismissSession, drainSessions } from "./dismissSession";
import {
	createRunSession,
	createSession,
	type Session,
	type SessionInfo,
	type SessionStatus,
} from "./createSession";
import { daemonLog } from "./daemonLog";
import { greetClient } from "./greetClient";
import { logSpawnedSession } from "./logSpawnedSession";
import { makeStatusChangeHandler } from "./makeStatusChangeHandler";
import { recordSessionUsage } from "./recordSessionUsage";
import { restartSession } from "./restartSession";
import { restoreAll } from "./restoreAll";
import { resumeSession } from "./resumeSession";
import { retrySession } from "./retrySession";
import { reuseSessionForRun } from "./reuseSessionForRun";
import { sessionLimits } from "./sessionLimits";
import { shutdownSessions } from "./shutdownSessions";
import { toSessionInfo } from "./toSessionInfo";
import { WindowsProxy } from "./WindowsProxy";
import { watchActivity } from "./watchActivity";
import { wirePtyEvents } from "./wirePtyEvents";
import * as sessionIo from "./writeToSession";

export class SessionManager {
	private sessions = new Map<string, Session>();
	// why: dispatch calls active.set() on card click; broadcasts include active.toJSON()
	readonly active = new ActiveSelection(() => this.notify());
	readonly clients = new ClientHub(persistUsagePeak);
	private readonly idCounter = { next: 1 };
	private shuttingDown = false;

	// why: dispatch calls windowsProxy.route() to forward windows-origin sessions
	readonly windowsProxy = new WindowsProxy(this.clients, () => this.notify());

	constructor(private readonly onIdleChange?: (idle: boolean) => void) {}

	addClient(client: SessionClient): void {
		this.clients.add(client);
		// why: notify sends the sessions list with the active selection in one message, avoiding a first-card race before greetClient
		this.notify();
		greetClient(client, this.sessions, this.windowsProxy);
	}

	removeClient(client: SessionClient): void {
		this.clients.delete(client);
		this.clients.unsubscribeLogs(client);
		this.onIdleChange?.(this.isIdle());
	}

	isIdle = (): boolean => this.sessions.size === 0 && this.clients.size === 0;

	shutdown(): void {
		this.shuttingDown = true;
		shutdownSessions(this.sessions);
	}

	restore(): string[] {
		return restoreAll(this.spawnWith, this.sessions);
	}

	drain = (): number => drainSessions(this.sessions, this.notify);

	private add(session: Session): string {
		this.wire(session);
		watchActivity(session, this.notify);
		logSpawnedSession(session);
		return session.id;
	}

	private readonly spawnWith = (create: (id: string) => Session): string =>
		this.add(create(sessionLimits.nextId(this.sessions.size, this.idCounter)));

	spawn(prompt?: string, cwd?: string): string {
		return this.spawnWith((id) => createSession(id, prompt, cwd));
	}

	spawnRun(runName: string, runArgs: string[], cwd?: string): string {
		return this.spawnWith((id) => createRunSession(id, runName, runArgs, cwd));
	}

	spawnAssist(
		assistArgs: string[],
		cwd?: string,
		meta?: AssistSessionMeta,
	): string {
		return this.spawnWith((id) =>
			createAssistSession(id, assistArgs, cwd, meta),
		);
	}

	resume(sessionId: string, cwd: string, name?: string): string {
		return this.spawnWith((id) => resumeSession(id, sessionId, cwd, name));
	}

	private readonly onStatusChange = makeStatusChangeHandler(
		(id) => this.dismissSession(id),
		() => this.notify(),
		(session, itemId) =>
			reuseSessionForRun(session, itemId, this.clients, this.onStatusChange),
	);

	private wire(session: Session): void {
		this.sessions.set(session.id, session);
		wirePtyEvents(session, this.clients, this.onStatusChange);
		this.notify();
	}

	writeToSession(id: string, data: string): void {
		sessionIo.writeToSession(this.sessions, id, data, this.onStatusChange);
	}

	resizeSession(id: string, cols: number, rows: number): void {
		sessionIo.resizeSession(this.sessions, id, cols, rows);
	}

	retrySession(id: string): void {
		const s = this.sessions.get(id);
		if (s && retrySession(s, this.clients, this.onStatusChange)) this.notify();
	}

	restart(id: string): void {
		const s = this.sessions.get(id);
		if (s && restartSession(s, this.clients, this.onStatusChange))
			this.notify();
	}

	dismissSession = (id: string): void => {
		if (dismissSession(this.sessions, id)) this.notify();
	};

	setAutoRun(id: string, enabled: boolean): void {
		if (sessionIo.setAutoRun(this.sessions, id, enabled)) this.notify();
	}

	setAutoAdvance(id: string, enabled: boolean): void {
		if (sessionIo.setAutoAdvance(this.sessions, id, enabled)) this.notify();
	}

	setStatus(id: string, status: SessionStatus): void {
		const session = this.sessions.get(id);
		if (!session) {
			daemonLog(
				`set-status for unknown session id=${id} status=${status} (no live session; ignoring)`,
			);
			return;
		}
		this.onStatusChange(session, status);
	}

	/* why: the status line relays token totals keyed by Claude's session id; join
	 * it to the running backlog phase so the spend accumulates against that row. */
	recordUsage(
		claudeSessionId: string,
		totalIn: number,
		totalOut: number,
	): void {
		recordSessionUsage(
			this.sessions.values(),
			claudeSessionId,
			totalIn,
			totalOut,
		);
	}

	listSessions = (): SessionInfo[] => {
		const local = [...this.sessions.values()].map(toSessionInfo);
		return local.concat(this.windowsProxy.sessions());
	};

	private readonly notify = (): void => {
		// During shutdown pty exits must not rewrite sessions.json, or the
		// done statuses would erase the metadata that resume needs on restart
		if (this.shuttingDown) return;
		const windows = this.windowsProxy.sessions();
		broadcastSessions(this.sessions, this.clients, windows, this.active);
		this.onIdleChange?.(this.isIdle());
	};
}
