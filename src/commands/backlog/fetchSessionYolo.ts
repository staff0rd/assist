import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";

/** Whether this backlog run's session is yolo, per the daemon's session flag and `sessions.yolo` config. */
export async function fetchSessionYolo(): Promise<boolean> {
	const sessionId =
		process.env.ASSIST_SESSION === "1"
			? process.env.ASSIST_SESSION_ID
			: undefined;
	if (!sessionId) return false;
	const reply = await requestDaemonReply<{ yolo: boolean }>(
		{ type: "session-yolo", sessionId },
		"session-yolo",
	);
	return reply?.yolo === true;
}
