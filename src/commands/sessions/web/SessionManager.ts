import type { WebSocket } from "ws";
import { isGitRepo } from "../../../shared/getInstallDir";
import {
	createSession,
	resumeSession,
	type Session,
	type SessionInfo,
} from "./createSession";
import { discoverSessions } from "./discoverSessions";
import { scheduleIdle } from "./scheduleIdle";
import { wirePtyEvents } from "./wirePtyEvents";
import {
	dismissSession,
	resizeSession,
	writeToSession,
} from "./writeToSession";
import { wsBroadcast, wsSend } from "./wsBroadcast";

export class SessionManager {
	private sessions = new Map<string, Session>();
	private clients = new Set<WebSocket>();
	private nextId = 1;
	private readonly repoCwd: string | undefined;

	constructor() {
		const cwd = process.cwd();
		this.repoCwd = isGitRepo(cwd) ? cwd : undefined;
	}

	addClient(ws: WebSocket): void {
		this.clients.add(ws);
		wsSend(ws, {
			type: "sessions",
			cwd: this.repoCwd,
			sessions: this.listSessions(),
		});
		this.replayScrollback(ws);
	}

	private replayScrollback(ws: WebSocket): void {
		for (const s of this.sessions.values()) {
			if (s.scrollback)
				wsSend(ws, { type: "output", sessionId: s.id, data: s.scrollback });
		}
	}

	removeClient(ws: WebSocket): void {
		this.clients.delete(ws);
	}

	spawn(prompt?: string, cwd?: string): string {
		const id = String(this.nextId++);
		const session = createSession(id, prompt, cwd);
		this.wire(session);
		return id;
	}

	resume(sessionId: string, cwd: string, name?: string): string {
		const id = String(this.nextId++);
		const session = resumeSession(id, sessionId, cwd, name);
		this.wire(session);
		return id;
	}

	private wire(session: Session): void {
		this.sessions.set(session.id, session);
		wirePtyEvents(session, this.clients, (s, status) => {
			s.status = status;
			this.notify();
		});
		scheduleIdle(session, () => {
			session.status = "waiting";
			this.notify();
		});
		this.notify();
	}

	writeToSession(id: string, data: string): void {
		writeToSession(this.sessions, id, data);
	}

	resizeSession(id: string, cols: number, rows: number): void {
		resizeSession(this.sessions, id, cols, rows);
	}

	dismissSession(id: string): void {
		if (dismissSession(this.sessions, id)) this.notify();
	}

	listSessions(): SessionInfo[] {
		return [...this.sessions.values()].map(
			({ id, name, status, startedAt }) => ({
				id,
				name,
				status,
				startedAt,
			}),
		);
	}

	async getHistory() {
		return discoverSessions();
	}

	private notify(): void {
		wsBroadcast(this.clients, {
			type: "sessions",
			sessions: this.listSessions(),
		});
	}
}
