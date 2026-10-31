import { createScanRunLog } from "./createScanRunLog";
import { createScheduleTracker } from "./createScheduleTracker";
import { isScheduledScanDue } from "./isScheduledScanDue";
import { runLoggedInboxScan } from "./runLoggedInboxScan";

const CHECK_MS = 60_000;

type InboxChange = "inbox" | "inbox-activity";

export function createInboxScanner() {
	let scanning = false;
	let lastError: string | undefined;
	let notify: (change: InboxChange) => void = () => {};
	const schedule = createScheduleTracker();
	const runLog = createScanRunLog(() => notify("inbox-activity"));

	const scan = async (reason: string) => {
		scanning = true;
		runLog.begin();
		notify("inbox");
		const outcome = await runLoggedInboxScan(reason, runLog.add);
		lastError = outcome.ok ? undefined : outcome.error;
		await runLog.end(outcome);
		scanning = false;
		notify("inbox");
	};

	const tick = async () => {
		const { intervalMinutes } = schedule.refresh();
		if (!intervalMinutes || scanning) return;
		if (await isScheduledScanDue(intervalMinutes)) await scan("scheduled");
	};

	return {
		start(onChange: (change: InboxChange) => void): () => void {
			notify = onChange;
			void runLog.restore();
			void tick();
			const timer = setInterval(() => void tick(), CHECK_MS);
			timer.unref();
			return () => clearInterval(timer);
		},
		scanNow(): boolean {
			if (scanning) return false;
			void scan("requested");
			return true;
		},
		status() {
			return {
				scanning,
				intervalMinutes: schedule.current().intervalMinutes ?? null,
				lastError: lastError ?? null,
				run: runLog.current() ?? null,
			};
		},
	};
}
