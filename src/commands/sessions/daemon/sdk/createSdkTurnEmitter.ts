import { daemonLog } from "../daemonLog";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import { createSdkProcessWatch } from "./procSampler/createSdkProcessWatch";
import { SDK_WORKING_ACTIVITY } from "./sdkActivityText";
import type { SdkTurnStatus } from "./sdkTurnStatus";

// why: the web row ticks the timer itself, so the daemon only resyncs it occasionally rather than broadcasting every progress heartbeat
const ELAPSED_RESYNC_SECONDS = 10;

export function createSdkTurnEmitter(
	label: string,
	control: SdkSessionControl,
) {
	let status: SdkTurnStatus | undefined;
	let activity: string | null = null;
	let elapsed: number | null = null;
	const processWatch = createSdkProcessWatch(
		() => control.process.pid,
		(process) => control.emit({ kind: "process", process }),
	);
	const setElapsed = (next: number | null) => {
		elapsed = next;
		control.emit({ kind: "elapsed", seconds: next });
	};
	return {
		activity: (next: string | null) => {
			if (next === activity) return;
			activity = next;
			control.emit({ kind: "activity", text: next });
			if (elapsed !== null) setElapsed(null);
			if (next === null || next === SDK_WORKING_ACTIVITY) processWatch.stop();
			else void processWatch.start();
		},
		stopProcessWatch: processWatch.stop,
		elapsed: (seconds: number) => {
			const next = Math.floor(seconds);
			if (
				elapsed !== null &&
				next >= elapsed &&
				next - elapsed < ELAPSED_RESYNC_SECONDS
			)
				return;
			setElapsed(next);
		},
		status: (next: SdkTurnStatus) => {
			if (next === status) return;
			status = next;
			daemonLog(`${label} sdk status: ${next}`);
			control.emit({ kind: "status", status: next });
		},
	};
}
