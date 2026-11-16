import type { SessionProcess } from "../../../shared/harnessAdapters/types";
import { assistArgsHarness } from "./assistArgsHarness";
import { spawnSdkWorkflow } from "./sdk/spawnSdkWorkflow";
import { spawnPty } from "./spawnPty";
import { startsDriven } from "./startsDriven";

export function spawnAssistProcess(
	args: string[],
	cwd?: string,
	sessionId?: string,
	extraEnv?: Record<string, string>,
): SessionProcess {
	const harness = assistArgsHarness(args.slice(1), cwd);
	if (harness && startsDriven(harness))
		return spawnSdkWorkflow(harness, args, cwd, sessionId, extraEnv);
	return spawnPty(args, cwd, sessionId, extraEnv);
}
