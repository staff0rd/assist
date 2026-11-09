export function envDetachedFromTrackedSession(
	extra: Record<string, string> = {},
): NodeJS.ProcessEnv {
	const {
		ASSIST_SESSION: _session,
		ASSIST_SESSION_ID: _sessionId,
		ASSIST_ACTIVITY_ID: _activityId,
		...env
	} = process.env;
	return { ...env, ...extra };
}
