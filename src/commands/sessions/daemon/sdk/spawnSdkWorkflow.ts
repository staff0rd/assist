import type { HarnessKind } from "../../../../shared/harnesses";
import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { refuseMissingCwd } from "../spawnPty";
import { createWorkflowRelay } from "./createWorkflowRelay";
import { killSdkChild } from "./killSdkChild";
import { pipeWorkflowOutput } from "./pipeWorkflowOutput";
import { noopDisposable, sdkTerminalStub } from "./sdkTerminalStub";
import { startWorkflowChild } from "./startWorkflowChild";
import { trackWorkflowExit } from "./trackWorkflowExit";

export function spawnSdkWorkflow(
	harness: HarnessKind,
	args: string[],
	cwd: string | undefined,
	sessionId: string | undefined,
	extraEnv?: Record<string, string>,
): SessionProcess {
	refuseMissingCwd(cwd, sessionId);
	const label = `session ${sessionId ?? "?"}`;
	const child = startWorkflowChild(args, cwd, sessionId, extraEnv);
	const { relay, output } = createWorkflowRelay(harness, label, args.join(" "));
	const dataListeners: ((data: string) => void)[] = [];
	pipeWorkflowOutput(child, label, (data, stream) => {
		output.append(stream, data);
		const terminal = data.replaceAll("\n", "\r\n");
		for (const listener of dataListeners) listener(terminal);
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
		onExit: trackWorkflowExit(child, label, () => {
			output.end();
			relay.current()?.kill();
		}),
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
