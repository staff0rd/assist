import type { ChildProcess } from "node:child_process";
import type {
	SdkSessionEvent,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { killSdkChild } from "./killSdkChild";
import { noopDisposable, sdkTerminalStub } from "./sdkTerminalStub";
import { type SdkTurnControls, sdkSessionHandle } from "./sdkSessionHandle";

type ExitListener = (e: { exitCode: number; signal?: number }) => void;

export type SdkSessionControl = {
	process: SessionProcess;
	emit: (event: SdkSessionEvent) => void;
	exit: (exitCode: number) => void;
	attach: (child: ChildProcess) => void;
	aborted: () => boolean;
	bind: (controls: SdkTurnControls) => void;
};

export function createSdkSessionProcess(
	sessionId: string | undefined,
	abort: AbortController,
): SdkSessionControl {
	const label = `session ${sessionId ?? "?"}`;
	const sdk = sdkSessionHandle(label);
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
		sdk: sdk.handle,
	};

	return {
		process: sessionProcess,
		emit: sdk.emit,
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
		bind: sdk.bind,
	};
}
