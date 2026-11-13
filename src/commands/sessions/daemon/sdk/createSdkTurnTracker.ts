import { daemonLog } from "../daemonLog";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkTurnStatus } from "./sdkTurnStatus";

export function createSdkTurnTracker(
	label: string,
	control: SdkSessionControl,
) {
	let status: SdkTurnStatus | undefined;
	let activity: string | null = null;
	const setActivity = (next: string | null) => {
		if (next === activity) return;
		activity = next;
		control.emit({ kind: "activity", text: next });
	};
	const setStatus = (next: SdkTurnStatus) => {
		if (next === "waiting") setActivity(null);
		if (next === status) return;
		status = next;
		daemonLog(`${label} sdk status: ${next}`);
		control.emit({ kind: "status", status: next });
	};
	return { setActivity, setStatus };
}
