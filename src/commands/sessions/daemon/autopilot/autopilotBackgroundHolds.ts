import type { Session } from "../types";
import type { AutopilotHeldMember } from "./AutopilotDeps";
import { activityPhaseLabel } from "./activityPhaseLabel";
import { autopilotSessionState } from "./autopilotSessionState";
import { quietMember } from "./quietMember";

const heldOnBackground = (session: Session) =>
	quietMember(session) && !!session.sdkBackgroundTasks?.length;

/** The run's members, when the only thing keeping the run live is members idle on background tasks. */
export function autopilotBackgroundHolds(
	root: Session | undefined,
	run: Session[],
	now: number,
): AutopilotHeldMember[] {
	if (autopilotSessionState(root) === "live") return [];
	const live = run.filter(
		(s) => s.id !== root?.id && s.status !== "done" && s.status !== "error",
	);
	if (!live.length || !live.every(heldOnBackground)) return [];
	return live.map((s) => ({
		sessionId: s.id,
		itemId: s.activity?.itemId,
		phase: activityPhaseLabel(s.activity),
		taskAgeMs: now - (s.sdkBackgroundTasksSince ?? s.waitingSince ?? now),
	}));
}
