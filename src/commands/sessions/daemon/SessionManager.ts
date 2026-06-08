import { discoverSessions } from "../shared/discoverSessions";
import { applyStatusChange } from "./applyStatusChange";
import { broadcast, type SessionClient } from "./broadcast";
import { createAssistSession } from "./createAssistSession";
import {
	createRunSession,
	createSession,
	type Session,
	type SessionInfo,
} from "./createSession";
import { greetClient } from "./greetClient";
import {
	loadPersistedSessions,
	persistLiveSessions,
} from "./loadPersistedSessions";
import { restoreSession } from "./restoreSession";
import { resumeSession } from "./resumeSession";
import { retrySession } from "./retrySession";
import { shutdownSessions } from "./shutdownSessions";
import { toSessionInfo } from "./toSessionInfo";
import { watchForClaudeSessionId } from "./watchForClaudeSessionId";
import { wirePtyEvents } from "./wirePtyEvents";
import {
	dismissSession,
	resizeSession,
	writeToSession,
} from "./writeToSession";

export class SessionManager {
	private sessions = new Map<string, Session>();
	private clients = new Set<SessionClient>();
	private nextId = 1;
	private shuttingDown = false;

	constructor(private readonly onIdleChange?: (idle: boolean) => void) {}

	addClient(client: SessionClient): void {
		this.clients.add(client);
		this.onIdleChange?.(this.isIdle());
		greetClient(client, this.sessions, () => this.listSessions());
	}

	removeClient(client: SessionClient): void {
		this.clients.delete(client);
		this.onIdleChange?.(this.isIdle());
	}

	isIdle(): boolean {
		return this.sessions.size === 0 && this.clients.size === 0;
	}

	shutdown(): void {
		this.shuttingDown = true;
		shutdownSessions(this.sessions);
	}

	restore(): string[] {
		return loadPersistedSessions().map((persisted) => {
			this.add(restoreSession(String(this.nextId++), persisted));
			return persisted.name;
		});
	}

	private add(session: Session): string {
		this.wire(session);
		watchForClaudeSessionId(session, this.sessions, this.notify);
		return session.id;
	}

	spawn(prompt?: string, cwd?: string): string {
		return this.add(createSession(String(this.nextId++), prompt, cwd));
	}

	spawnRun(runName: string, runArgs: string[], cwd?: string): string {
		return this.add(
			createRunSession(String(this.nextId++), runName, runArgs, cwd),
		);
	}

	spawnAssist(assistArgs: string[], cwd?: string): string {
		return this.add(
			createAssistSession(String(this.nextId++), assistArgs, cwd),
		);
	}

	resume(sessionId: string, cwd: string, name?: string): string {
		return this.add(resumeSession(String(this.nextId++), sessionId, cwd, name));
	}

	private readonly onStatusChange = (
		s: Session,
		status: Session["status"],
		exitCode?: number,
	) => applyStatusChange(s, status, exitCode, this.dismissSession, this.notify);

	private wire(session: Session): void {
		this.sessions.set(session.id, session);
		wirePtyEvents(session, this.clients, this.onStatusChange);
		this.notify();
	}

	writeToSession(id: string, data: string): void {
		writeToSession(this.sessions, id, data);
	}

	resizeSession(id: string, cols: number, rows: number): void {
		resizeSession(this.sessions, id, cols, rows);
	}

	retrySession(id: string): void {
		const s = this.sessions.get(id);
		if (s && retrySession(s, this.clients, this.onStatusChange)) this.notify();
	}

	dismissSession = (id: string): void => {
		if (dismissSession(this.sessions, id)) this.notify();
	};

	listSessions(): SessionInfo[] {
		return [...this.sessions.values()].map(toSessionInfo);
	}

	async getHistory() {
		return discoverSessions();
	}

	private readonly notify = (): void => {
		// During shutdown pty exits must not rewrite sessions.json, or the
		// done statuses would erase the metadata that resume needs on restart
		if (this.shuttingDown) return;
		persistLiveSessions(this.sessions);
		broadcast(this.clients, {
			type: "sessions",
			sessions: this.listSessions(),
		});
		this.onIdleChange?.(this.isIdle());
	};
}
