import { sessionChildEnv } from "../sessionChildEnv";

export function workflowQueryEnv(
	base: Record<string, string | undefined>,
	sessionId: string | undefined,
	launcherEnv: Record<string, string> | undefined,
): Record<string, string> {
	const env: Record<string, string> = {
		...sessionChildEnv(base, sessionId),
		// why: claude turns the Artifact tool off for SDK-driven runs unless this opts back in
		CLAUDE_CODE_ARTIFACT: base.CLAUDE_CODE_ARTIFACT ?? "1",
	};
	if (!launcherEnv) return env;
	const { ASSIST_ACTIVITY_ID: _activityId, ...rest } = env;
	return { ...rest, ...launcherEnv };
}
