import type { Session } from "./createSession";

export type ServerConflictInfo = {
	id: string;
	name: string;
	cwd?: string;
	port?: number;
};

export function serverConflictInfo(session: Session): ServerConflictInfo {
	return {
		id: session.id,
		name: session.name,
		cwd: session.cwd,
		port: session.serverPort,
	};
}
