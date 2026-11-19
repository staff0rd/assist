import type { SessionInfo } from "./daemon/createSession";
import { actOnSession } from "./target/actOnSession";

function refuseNonSdk(session: SessionInfo): string | undefined {
	if (session.sdk) return undefined;
	return String.raw`Session ${session.id} is not a Claude SDK session, so it cannot be interrupted; send it Escape with: assist sessions send ${session.id} --keys '\e'`;
}

export function interruptSession(options: { id?: string } = {}): Promise<void> {
	return actOnSession(
		options.id,
		"interrupt",
		(sessionId) => ({ type: "interrupt", sessionId }),
		refuseNonSdk,
	);
}
