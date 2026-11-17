import { daemonLog } from "../daemonLog";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { DrivenTurnStatus } from "./DrivenTurnEvent";

export function createSdkStatusEmitter(
	label: string,
	control: SdkSessionControl,
) {
	let status: DrivenTurnStatus | undefined;
	const emit = (next: DrivenTurnStatus, note = "") => {
		status = next;
		daemonLog(`${label} sdk status: ${next}${note}`);
		control.emit({ kind: "status", status: next });
	};
	return {
		status: (next: DrivenTurnStatus) => {
			if (next !== status) emit(next);
		},
		resyncStatus: (next: DrivenTurnStatus) => emit(next, " (resync)"),
	};
}
