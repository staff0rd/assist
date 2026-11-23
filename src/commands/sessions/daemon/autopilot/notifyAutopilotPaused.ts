import { showNotification } from "../../../notify/showNotification";
import { loadConfig } from "../../../../shared/loadConfig";
import { daemonLog } from "../daemonLog";

export function notifyAutopilotPaused(title: string, message: string): void {
	try {
		if (!loadConfig().notify?.enabled) {
			daemonLog(`autopilot: notify disabled; not showing "${title}"`);
			return;
		}
		const shown = showNotification({ title, message, sound: "Alarm" });
		daemonLog(
			`autopilot: notification "${title}" ${shown ? "shown" : "not shown"}`,
		);
	} catch (error) {
		daemonLog(`autopilot: notification "${title}" failed: ${String(error)}`);
	}
}
