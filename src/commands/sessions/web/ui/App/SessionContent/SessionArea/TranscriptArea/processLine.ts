import type { SessionInfo } from "../../../../types";
import { formatIoRate } from "./formatIoRate";

export function processLine(session: SessionInfo) {
	const process = session.sdkProcess;
	if (!process || session.sdkInterrupting) return undefined;
	return {
		command: process.command,
		rate:
			process.ioBytesPerSec === undefined
				? undefined
				: formatIoRate(process.ioBytesPerSec),
	};
}
