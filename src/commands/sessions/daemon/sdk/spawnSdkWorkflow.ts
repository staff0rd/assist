import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { refuseMissingCwd } from "../spawnPty";
import { createSdkRelay } from "./createSdkRelay";
import { killSdkChild } from "./killSdkChild";
import { pipeWorkflowOutput } from "./pipeWorkflowOutput";
import { noopDisposable, sdkTerminalStub } from "./sdkTerminalStub";
import { startWorkflowChild } from "./startWorkflowChild";
import { trackWorkflowExit } from "./trackWorkflowExit";

export function spawnSdkWorkflow(
	args: string[],
	cwd: string | undefined,
	sessionId: string | undefined,
	extraEnv?: Record<string, string>,
): SessionProcess {
	refuseMissingCwd(cwd, sessionId);
	const label = `session ${sessionId ?? "?"}`;
	const child = startWorkflowChild(args, cwd, sessionId, extraEnv);
	const relay = createSdkRelay(label);
	const dataListeners: ((data: string) => void)[] = [];
	pipeWorkflowOutput(child, label, (data) => {
		for (const listener of dataListeners) listener(data);
	});
	return {
		get pid() {
			return child.pid ?? 0;
		},
		...sdkTerminalStub(label),
		onData: (listener) => {
			dataListeners.push(listener);
			return noopDisposable;
		},
		onExit: trackWorkflowExit(child, label, () => relay.current()?.kill()),
		kill: () => {
			daemonLog(
				`${label} sdk workflow ended by kill (pid ${child.pid ?? "none"})`,
			);
			relay.current()?.kill();
			killSdkChild(child);
		},
		sdk: relay.handle,
	};
}
