import { emptyScanUsage } from "../../../inbox/emptyScanUsage";
import type {
	InboxScanEvent,
	InboxScanRun,
	InboxScanUsage,
} from "../../../inbox/InboxScanEvent";
import { createActivityThrottle } from "./createActivityThrottle";
import { loadScanRun } from "./loadScanRun";
import { outcomeEvent } from "./outcomeEvent";
import type { ScanOutcome } from "./runLoggedInboxScan";
import { saveScanRun } from "./saveScanRun";

const MAX_EVENTS = 1000;

export function createScanRunLog(onActivity: () => void) {
	let run: InboxScanRun | undefined;
	const throttle = createActivityThrottle(onActivity);

	return {
		current: () => run,
		begin() {
			run = {
				status: "scanning",
				startedAt: new Date().toISOString(),
				finishedAt: null,
				events: [],
				usage: emptyScanUsage(),
			};
		},
		onEvent(event: InboxScanEvent) {
			if (!run || run.events.length >= MAX_EVENTS) return;
			run.events.push(event);
			throttle.schedule();
		},
		onUsage(usage: InboxScanUsage) {
			if (!run) return;
			run.usage = usage;
			throttle.schedule();
		},
		async end(outcome: ScanOutcome) {
			throttle.cancel();
			if (!run) return;
			run.events.push(outcomeEvent(outcome));
			run.status = outcome.ok ? "finished" : "failed";
			run.finishedAt = new Date().toISOString();
			await saveScanRun(run);
		},
		async restore() {
			const saved = await loadScanRun();
			if (run || !saved) return;
			run = saved;
			onActivity();
		},
	};
}
