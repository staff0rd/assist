import { daemonLog } from "../daemonLog";
import { isInboxScanDue } from "./isInboxScanDue";
import { type InboxSchedule, readInboxSchedule } from "./readInboxSchedule";
import { runLoggedInboxScan } from "./runLoggedInboxScan";

const CHECK_MS = 60_000;

export function createInboxScanner() {
	let scanning = false;
	let lastError: string | undefined;
	let schedule: InboxSchedule = { description: "not started" };
	let notify: () => void = () => {};

	const scan = async (reason: string) => {
		scanning = true;
		notify();
		lastError = await runLoggedInboxScan(reason);
		scanning = false;
		notify();
	};

	const tick = async () => {
		const next = readInboxSchedule();
		if (next.description !== schedule.description)
			daemonLog(`inbox: scheduled scans ${next.description}`);
		schedule = next;
		if (!schedule.intervalMinutes || scanning) return;
		try {
			if (await isInboxScanDue(schedule.intervalMinutes))
				await scan("scheduled");
		} catch (error) {
			daemonLog(`inbox: reading the last scan time failed: ${String(error)}`);
		}
	};

	return {
		start(onChange: () => void): () => void {
			notify = onChange;
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
				intervalMinutes: schedule.intervalMinutes ?? null,
				lastError: lastError ?? null,
			};
		},
	};
}
