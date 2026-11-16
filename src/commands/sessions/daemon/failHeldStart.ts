import type { Session } from "./types";

export function failHeldStart(session: Session, reason: string): void {
	session.pendingStart = () => {
		throw new Error(reason);
	};
}
