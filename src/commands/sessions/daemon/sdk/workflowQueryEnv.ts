import { sessionChildEnv } from "../sessionChildEnv";

export function workflowQueryEnv(
	base: Record<string, string | undefined>,
	sessionId: string | undefined,
	launcherEnv: Record<string, string> | undefined,
): Record<string, string> {
	const env = sessionChildEnv(base, sessionId);
	if (!launcherEnv) return env;
	const { ASSIST_ACTIVITY_ID: _activityId, ...rest } = env;
	return { ...rest, ...launcherEnv };
}
