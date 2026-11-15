import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";

export const noopDisposable = { dispose: () => {} };

export function sdkTerminalStub(
	label: string,
): Pick<SessionProcess, "cols" | "rows" | "write" | "resize" | "onData"> {
	const skip = (path: string) => () =>
		daemonLog(`${label} ${path} skipped: driven session has no terminal`);
	return {
		cols: 0,
		rows: 0,
		write: skip("input"),
		resize: skip("resize"),
		onData: () => noopDisposable,
	};
}
