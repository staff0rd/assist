import { ActiveSelection } from "./ActiveSelection";
import type { SessionClient } from "./broadcast";
import { broadcastSessions } from "./broadcastSessions";
import { ClientHub } from "./ClientHub";
import { createAssistSession } from "./createAssistSession";
import {
	createRunSession,
	createSession,
	type Session,
	type SessionInfo,
} from "./createSession";
import { greetClient } from "./greetClient";
import { loadPersistedSessions } from "./loadPersistedSessions";
import { makeStatusChangeHandler } from "./makeStatusChangeHandler";
import { restoreSession } from "./restoreSession";
import { resumeSession } from "./resumeSession";
import { retrySession } from "./retrySession";
import { reuseSessionForRun } from "./reuseSessionForRun";
import { shutdownSessions } from "./shutdownSessions";
import { toSessionInfo } from "./toSessionInfo";
import { WindowsProxy } from "./WindowsProxy";
import { watchActivity } from "./watchActivity";
import { watchForClaudeSessionId } from "./watchForClaudeSessionId";
import { wirePtyEvents } from "./wirePtyEvents";
import * as sessionIo from "./writeToSession";

export class SessionManager {
	private sessions = new Map<string, Session>();
	// why: dispatch calls active.set() on card click; broadcasts include active.toJSON()
	readonly active = new ActiveSelection(() => this.notify());
	readonly clients = new ClientHub();
	private nextId = 1;
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
		this.onIdleChange?.(this.isIdle());
	}

	isIdle = (): boolean => this.sessions.size === 0 && this.clients.size === 0;

	shutdown(): void {
		this.shuttingDown = true;
		shutdownSessions(this.sessions);
	}

	restore(): string[] {
		return loadPersistedSessions().map((persisted) => {
			this.spawnWith((id) => restoreSession(id, persisted));
			return persisted.name;
		});
	}

	private add(session: Session): string {
		this.wire(session);
		watchForClaudeSessionId(session, this.sessions, this.notify);
		watchActivity(session, this.notify);
		return session.id;
	}

	private spawnWith(create: (id: string) => Session): string {
		return this.add(create(String(this.nextId++)));
	}

	spawn(prompt?: string, cwd?: string): string {
		return this.spawnWith((id) => createSession(id, prompt, cwd));
	}

	spawnRun(runName: string, runArgs: string[], cwd?: string): string {
		return this.spawnWith((id) => createRunSession(id, runName, runArgs, cwd));
	}

	spawnAssist(assistArgs: string[], cwd?: string): string {
		return this.spawnWith((id) => createAssistSession(id, assistArgs, cwd));
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
		sessionIo.writeToSession(this.sessions, id, data);
	}

	resizeSession(id: string, cols: number, rows: number): void {
		sessionIo.resizeSession(this.sessions, id, cols, rows);
	}

	retrySession(id: string): void {
		const s = this.sessions.get(id);
		if (s && retrySession(s, this.clients, this.onStatusChange)) this.notify();
	}

	dismissSession = (id: string): void => {
		if (sessionIo.dismissSession(this.sessions, id)) this.notify();
	};

	setAutoRun(id: string, enabled: boolean): void {
		if (sessionIo.setAutoRun(this.sessions, id, enabled)) this.notify();
	}

	setAutoAdvance(id: string, enabled: boolean): void {
		if (sessionIo.setAutoAdvance(this.sessions, id, enabled)) this.notify();
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
