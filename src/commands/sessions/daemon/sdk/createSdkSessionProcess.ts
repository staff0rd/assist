import type { ChildProcess } from "node:child_process";
import type {
	SdkSessionEvent,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { killSdkChild } from "./killSdkChild";
import { noopDisposable, sdkTerminalStub } from "./sdkTerminalStub";

type ExitListener = (e: { exitCode: number; signal?: number }) => void;

export type SdkSessionControl = {
	process: SessionProcess;
	emit: (event: SdkSessionEvent) => void;
	exit: (exitCode: number) => void;
	attach: (child: ChildProcess) => void;
	aborted: () => boolean;
};

export function createSdkSessionProcess(
	sessionId: string | undefined,
	abort: AbortController,
): SdkSessionControl {
	const label = `session ${sessionId ?? "?"}`;
	const eventListeners: ((event: SdkSessionEvent) => void)[] = [];
	const exitListeners: ExitListener[] = [];
	let child: ChildProcess | undefined;
	let exited = false;

	const sessionProcess: SessionProcess = {
		get pid() {
			return child?.pid ?? 0;
		},
		...sdkTerminalStub(label),
		kill: () => {
			daemonLog(
				`${label} sdk query ended by kill (child pid ${child?.pid ?? "none"})`,
			);
			abort.abort();
			killSdkChild(child);
		},
		onExit: (listener) => {
			exitListeners.push(listener);
			return noopDisposable;
		},
		sdk: { onEvent: (listener) => eventListeners.push(listener) },
	};

	return {
		process: sessionProcess,
		emit: (event) => {
			for (const listener of eventListeners) listener(event);
		},
		exit: (exitCode) => {
			if (exited) return;
			exited = true;
			killSdkChild(child);
			for (const listener of exitListeners) listener({ exitCode });
		},
		attach: (spawned) => {
			child = spawned;
		},
		aborted: () => abort.signal.aborted,
	};
}
