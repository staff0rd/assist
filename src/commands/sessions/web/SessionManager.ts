import type { WebSocket } from "ws";
import { isGitRepo } from "../../../shared/getInstallDir";
import {
	createRunSession,
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

	private add(session: Session): string {
		this.wire(session);
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

	resume(sessionId: string, cwd: string, name?: string): string {
		return this.add(resumeSession(String(this.nextId++), sessionId, cwd, name));
	}

	private readonly onStatusChange = (s: Session, status: Session["status"]) => {
		s.status = status;
		this.notify();
	};

	private wire(session: Session): void {
		this.sessions.set(session.id, session);
		wirePtyEvents(session, this.clients, this.onStatusChange);
		scheduleIdle(session, () => this.onStatusChange(session, "waiting"));
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
			({
				id,
				name,
				commandType,
				status,
				startedAt,
				runName,
				runArgs,
				cwd,
			}) => ({
				id,
				name,
				commandType,
				status,
				startedAt,
				runName,
				runArgs,
				cwd,
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
