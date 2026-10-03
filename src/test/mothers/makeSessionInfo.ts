import type { SessionInfo } from "../../commands/sessions/web/ui/types";

export function makeSessionInfo(
	overrides: Partial<SessionInfo> = {},
): SessionInfo {
	return {
		id: "1",
		name: "repo/session",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}
