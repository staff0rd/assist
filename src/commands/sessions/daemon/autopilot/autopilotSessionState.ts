import type { Session } from "../types";

export type AutopilotSessionState = "live" | "ended" | "errored";

export function autopilotSessionState(
	session: Session | undefined,
): AutopilotSessionState {
	if (!session) return "ended";
	if (session.status === "error") return "errored";
	if (session.status === "running") return "live";
	/* why: an interactive session idles at "waiting" once its turn ends, so it
	 * only still counts as live while a preview or permission prompt holds it. */
	if (session.status === "waiting")
		return session.pendingPrPreview || session.permissionActive
			? "live"
			: "ended";
	return "ended";
}
