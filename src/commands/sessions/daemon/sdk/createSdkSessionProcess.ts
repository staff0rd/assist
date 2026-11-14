import type { ChildProcess } from "node:child_process";
import type {
	SdkSessionEvent,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { killSdkChild } from "./killSdkChild";
import { createSdkExit } from "./createSdkExit";
import { sdkTerminalStub } from "./sdkTerminalStub";
import { type SdkTurnControls, sdkSessionHandle } from "./sdkSessionHandle";

export type SdkSessionControl = {
	process: SessionProcess;
	emit: (event: SdkSessionEvent) => void;
	exit: (exitCode: number) => void;
	attach: (child: ChildProcess) => void;
	aborted: () => boolean;
	bind: (controls: SdkTurnControls) => void;
	prefix: (text: string) => string;
};

export function createSdkSessionProcess(
	sessionId: string | undefined,
	abort: AbortController,
): SdkSessionControl {
	const label = `session ${sessionId ?? "?"}`;
	const sdk = sdkSessionHandle(label);
	let child: ChildProcess | undefined;
	const exit = createSdkExit(sdk.emit, () => child);

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
		onExit: exit.onExit,
		sdk: sdk.handle,
	};

	return {
		process: sessionProcess,
		emit: sdk.emit,
		exit: exit.exit,
		attach: (spawned) => {
			child = spawned;
		},
		aborted: () => abort.signal.aborted,
		bind: sdk.bind,
		prefix: sdk.prefix,
	};
}
