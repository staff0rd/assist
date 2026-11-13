import type { ChildProcess } from "node:child_process";
import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { noopDisposable } from "./sdkTerminalStub";

type ExitListener = (e: { exitCode: number; signal?: number }) => void;

export function trackWorkflowExit(
	child: ChildProcess,
	label: string,
	onExit: () => void,
): SessionProcess["onExit"] {
	const listeners: ExitListener[] = [];
	let exited = false;
	const finish = (exitCode: number) => {
		if (exited) return;
		exited = true;
		onExit();
		for (const listener of listeners) listener({ exitCode });
	};
	child.on("error", (error) => {
		daemonLog(`${label} sdk workflow failed to start: ${error.message}`);
		finish(1);
	});
	child.on("exit", (code, signal) => {
		daemonLog(`${label} sdk workflow exited: code ${code} signal ${signal}`);
		finish(code ?? (signal ? 1 : 0));
	});
	return (listener) => {
		listeners.push(listener);
		return noopDisposable;
	};
}
