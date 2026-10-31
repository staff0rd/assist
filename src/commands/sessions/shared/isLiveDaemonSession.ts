import { requestDaemonReply } from "../daemon/requestDaemonReply";

const LIVE_TIMEOUT_MS = 1_000;

export async function isLiveDaemonSession(sessionId: string): Promise<boolean> {
	const reply = await requestDaemonReply<{ live?: boolean }>(
		{ type: "session-live", sessionId },
		"session-live",
		LIVE_TIMEOUT_MS,
	);
	return reply?.live === true;
}
