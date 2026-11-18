import type { SessionInfo } from "../../types";

export function workingActivity(session: SessionInfo): string {
	if (session.sdkActivity) return session.sdkActivity;
	const { activity } = session;
	if (activity?.phase && activity.phaseName)
		return `Phase ${activity.phase}: ${activity.phaseName}`;
	return session.lastAssistantMessage ?? "Working";
}
