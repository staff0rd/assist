import type { ChildProcess } from "node:child_process";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { killSdkChild } from "./killSdkChild";
import { noopDisposable } from "./sdkTerminalStub";

type ExitListener = (e: { exitCode: number; signal?: number }) => void;

export function createSdkExit(
	emit: (event: SdkSessionEvent) => void,
	child: () => ChildProcess | undefined,
) {
	const listeners: ExitListener[] = [];
	let exited = false;
	return {
		onExit: (listener: ExitListener) => {
			listeners.push(listener);
			return noopDisposable;
		},
		exit: (exitCode: number) => {
			if (exited) return;
			exited = true;
			emit({ kind: "pending", texts: [] });
			killSdkChild(child());
			for (const listener of listeners) listener({ exitCode });
		},
	};
}
