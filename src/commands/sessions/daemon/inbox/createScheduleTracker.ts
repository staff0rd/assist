import { daemonLog } from "../daemonLog";
import { type InboxSchedule, readInboxSchedule } from "./readInboxSchedule";

export function createScheduleTracker() {
	let schedule: InboxSchedule = { description: "not started" };
	return {
		current: () => schedule,
		refresh(): InboxSchedule {
			const next = readInboxSchedule();
			if (next.description !== schedule.description)
				daemonLog(`inbox: scheduled scans ${next.description}`);
			schedule = next;
			return schedule;
		},
	};
}
