import type { WebSocket } from "ws";
import { createSession, type Session } from "./createSession";
import { clearIdle, scheduleIdle } from "./scheduleIdle";
import { wirePtyEvents } from "./wirePtyEvents";
import { wsBroadcast, wsSend } from "./wsBroadcast";

type SessionInfo = {
	id: string;
	name: string;
	status: string;
	startedAt: number;
};

export class SessionManager {
	private sessions = new Map<string, Session>();
	private clients = new Set<WebSocket>();
	private nextId = 1;

	addClient(ws: WebSocket): void {
		this.clients.add(ws);
		wsSend(ws, { type: "sessions", sessions: this.listSessions() });
		for (const s of this.sessions.values()) {
			if (s.scrollback)
				wsSend(ws, { type: "output", sessionId: s.id, data: s.scrollback });
		}
	}

	removeClient(ws: WebSocket): void {
		this.clients.delete(ws);
	}

	spawn(prompt?: string): string {
		const id = String(this.nextId++);
		const session = createSession(id, prompt);
		this.sessions.set(id, session);
		wirePtyEvents(session, this.clients, (s, status) => {
			s.status = status;
			this.notify();
		});
		scheduleIdle(session, () => {
			session.status = "waiting";
			this.notify();
		});
		this.notify();
		return id;
	}

	writeToSession(id: string, data: string): void {
		const s = this.sessions.get(id);
		if (s && s.status !== "done") s.pty.write(data);
	}

	resizeSession(id: string, cols: number, rows: number): void {
		const s = this.sessions.get(id);
		if (s && s.status !== "done") {
			s.lastResizeAt = Date.now();
			s.pty.resize(cols, rows);
		}
	}

	dismissSession(id: string): void {
		const s = this.sessions.get(id);
		if (!s) return;
		if (s.status !== "done") s.pty.kill();
		clearIdle(s);
		this.sessions.delete(id);
		this.notify();
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

	private notify(): void {
		wsBroadcast(this.clients, {
			type: "sessions",
			sessions: this.listSessions(),
		});
	}
}
