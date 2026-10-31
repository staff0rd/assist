import type {
	InboxScanEvent,
	InboxScanRun,
} from "../../../inbox/InboxScanEvent";
import { loadScanRun } from "./loadScanRun";
import { outcomeEvent } from "./outcomeEvent";
import type { ScanOutcome } from "./runLoggedInboxScan";
import { saveScanRun } from "./saveScanRun";

const ACTIVITY_THROTTLE_MS = 1000;
const MAX_EVENTS = 1000;

export function createScanRunLog(onActivity: () => void) {
	let run: InboxScanRun | undefined;
	let pending: ReturnType<typeof setTimeout> | undefined;

	const flush = () => {
		pending = undefined;
		onActivity();
	};

	return {
		current: () => run,
		begin() {
			run = {
				status: "scanning",
				startedAt: new Date().toISOString(),
				finishedAt: null,
				events: [],
			};
		},
		add(event: InboxScanEvent) {
			if (!run || run.events.length >= MAX_EVENTS) return;
			run.events.push(event);
			pending ??= setTimeout(flush, ACTIVITY_THROTTLE_MS);
		},
		async end(outcome: ScanOutcome) {
			clearTimeout(pending);
			pending = undefined;
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
