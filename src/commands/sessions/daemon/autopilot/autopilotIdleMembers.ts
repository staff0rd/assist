import type { Session } from "../types";
import type { AutopilotIdleMember } from "./AutopilotDeps";
import { activityPhaseLabel } from "./activityPhaseLabel";

function idle(session: Session): boolean {
	return (
		session.status === "waiting" &&
		session.waitingSince !== null &&
		!session.pendingPrPreview &&
		!session.permissionActive &&
		!session.pendingPrompts?.length &&
		!session.deferredCommands?.length &&
		!session.sdkBackgroundTasks?.length
	);
}

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
