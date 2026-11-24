import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import { autopilotRunContract } from "./autopilotRunContract";
import { formatItemId } from "./formatItemId";

/** The autopilot run contract for this session's backlog run, when an autopilot run started it. */
export async function fetchAutopilotRunContract(
	itemId: number,
): Promise<string | undefined> {
	const sessionId =
		process.env.ASSIST_SESSION === "1"
			? process.env.ASSIST_SESSION_ID
			: undefined;
	if (!sessionId) return undefined;
	const reply = await requestDaemonReply<{
		autopilot: boolean;
		nextTickAt?: string;
	}>({ type: "autopilot-session", sessionId }, "autopilot-session");
	if (!reply?.autopilot || !reply.nextTickAt) return undefined;
	return autopilotRunContract(reply.nextTickAt, formatItemId(itemId));
}
