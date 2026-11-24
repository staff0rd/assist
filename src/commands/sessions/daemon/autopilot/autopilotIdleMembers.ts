import type { Session } from "../types";
import type { AutopilotIdleMember } from "./AutopilotDeps";
import { activityPhaseLabel } from "./activityPhaseLabel";
import { quietMember } from "./quietMember";

const idle = (session: Session) =>
	quietMember(session) && !session.sdkBackgroundTasks?.length;

/** Sessions the run rooted at rootId started whose turn ended with nothing pending or running in the background. */
export function autopilotIdleMembers(
	sessions: Session[],
	rootId: string,
): AutopilotIdleMember[] {
	return sessions
		.filter((s) => s.autopilot === rootId && s.id !== rootId && idle(s))
		.map((s) => ({
			sessionId: s.id,
			waitingSince: s.waitingSince ?? 0,
			itemId: s.activity?.itemId,
			phase: activityPhaseLabel(s.activity),
			lastMessage: s.lastAssistantMessage,
		}));
}
