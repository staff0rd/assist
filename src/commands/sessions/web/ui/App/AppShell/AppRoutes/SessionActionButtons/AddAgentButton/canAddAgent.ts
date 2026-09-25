import type { SessionInfo } from "../../../../../types";

export function canAddAgent(session: SessionInfo): boolean {
	return session.joinable === true;
}
