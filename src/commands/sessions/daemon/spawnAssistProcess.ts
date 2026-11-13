import type { SessionProcess } from "../../../shared/harnessAdapters/types";
import { assistArgsHarness } from "./assistArgsHarness";
import { spawnSdkWorkflow } from "./sdk/spawnSdkWorkflow";
import { spawnPty } from "./spawnPty";

export function spawnAssistProcess(
	args: string[],
	cwd?: string,
	sessionId?: string,
	extraEnv?: Record<string, string>,
): SessionProcess {
	if (assistArgsHarness(args.slice(1), cwd) === "claude-sdk")
		return spawnSdkWorkflow(args, cwd, sessionId, extraEnv);
	return spawnPty(args, cwd, sessionId, extraEnv);
}
