import type { SessionInfo } from "../../types";

export function awaitingSince(session: SessionInfo): number {
	if (session.waitingSince) return session.waitingSince;
	const echoed = session.lastEchoAt ? Date.parse(session.lastEchoAt) : NaN;
	return Number.isNaN(echoed) ? session.startedAt : echoed;
}
