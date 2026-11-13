import type { Session } from "./types";

export function isSdkSession(session: Session): boolean {
	return Boolean(session.pty?.sdk);
}
