import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
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
	const harness = assistArgsHarness(args.slice(1), cwd);
	if (harness && harnessCapability(harness, "session.driven").supported)
		return spawnSdkWorkflow(args, cwd, sessionId, extraEnv);
	return spawnPty(args, cwd, sessionId, extraEnv);
}
