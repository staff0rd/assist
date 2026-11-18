import type { SessionInfo } from "../../types";

export function workingActivity(session: SessionInfo): string {
	return session.sdkActivity || (session.lastAssistantMessage ?? "Working");
}
