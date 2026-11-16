import { sessionConversationTarget } from "../../../../shared/sessionConversationTarget";
import type { HistoricalSession } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { useLaunchLanding } from "../PhoneBacklog/useLaunchLanding";

export function usePhoneResume(
	socket: SessionSocket,
	entry: HistoricalSession | undefined,
) {
	const resumed = entry
		? socket.sessions.find(
				(s) => sessionConversationTarget(s)?.conversationId === entry.sessionId,
			)
		: undefined;
	const { launched, latch } = useLaunchLanding(resumed);

	return {
		resuming: launched,
		resume: () => {
			if (launched || !entry) return;
			latch();
			socket.resumeSession(
				entry.sessionId,
				entry.cwd,
				entry.name,
				entry.harness,
				entry.node,
			);
		},
	};
}
