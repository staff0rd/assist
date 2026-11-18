import { withHarnessPath } from "../../../../shared/nodeRuntime/withHarnessPath";
import { sdkAgentEnv } from "../../../../shared/sdkAgentEnv";
import { sessionBinDirs } from "../sessionBinDirs";
import { sessionChildEnv } from "../sessionChildEnv";

export function workflowQueryEnv(
	base: Record<string, string | undefined>,
	sessionId: string | undefined,
	launcherEnv: Record<string, string> | undefined,
	cwd?: string,
): Record<string, string> {
	const env: Record<string, string> = {
		...sessionChildEnv(base, sessionId),
		// why: claude turns the Artifact tool off for SDK-driven runs unless this opts back in
		CLAUDE_CODE_ARTIFACT: base.CLAUDE_CODE_ARTIFACT ?? "1",
		[sdkAgentEnv]: "1",
	};
	const binDirs = sessionBinDirs(cwd, sessionId);
	if (!launcherEnv) return withHarnessPath(env, binDirs);
	const { ASSIST_ACTIVITY_ID: _activityId, ...rest } = env;
	return withHarnessPath({ ...rest, ...launcherEnv }, binDirs);
}
