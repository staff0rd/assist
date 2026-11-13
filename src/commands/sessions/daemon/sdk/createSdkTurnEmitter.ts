import { daemonLog } from "../daemonLog";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkTurnStatus } from "./sdkTurnStatus";

export function createSdkTurnEmitter(
	label: string,
	control: SdkSessionControl,
) {
	let status: SdkTurnStatus | undefined;
	let activity: string | null = null;
	return {
		activity: (next: string | null) => {
			if (next === activity) return;
			activity = next;
			control.emit({ kind: "activity", text: next });
		},
		status: (next: SdkTurnStatus) => {
			if (next === status) return;
			status = next;
			daemonLog(`${label} sdk status: ${next}`);
			control.emit({ kind: "status", status: next });
		},
	};
}
