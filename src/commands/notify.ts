import { activeHarness } from "../lib/activeHarness";
import { readStdin } from "../lib/readStdin";
import {
	harnessLabel,
	harnessProductLabel,
} from "../shared/harnessAdapters/harnessLabel";
import { loadConfig } from "../shared/loadConfig";
import { showNotification } from "./notify/showNotification";

type NotificationInput = {
	session_id?: string;
	notification_type: string;
	cwd?: string;
	message?: string;
};

export async function notify(): Promise<void> {
	const config = loadConfig();
	if (!config.notify?.enabled) {
		return;
	}

	const inputData = await readStdin();
	const data: NotificationInput = JSON.parse(inputData);
	const { notification_type, cwd, message } = data;

	const projectName = cwd?.split(/[/\\]/).pop() ?? "Unknown Project";

	const harness = activeHarness();
	const agent = harnessLabel(harness);
	let title: string;
	let body: string;
	let sound: string;

	switch (notification_type) {
		case "permission_prompt":
			title = `${agent} needs permission`;
			body = `${projectName} - ${message || "Permission required"}`;
			sound = "Alarm";
			break;
		case "idle_prompt":
			title = `${agent} is waiting`;
			body = `${projectName} - Waiting for your input`;
			sound = "Reminder";
			break;
		default:
			title = harnessProductLabel(harness);
			body = message ? `${projectName} - ${message}` : projectName;
			sound = "Default";
	}

	showNotification({ title, message: body, sound });
	console.log(`Notification sent: ${notification_type} for ${projectName}`);
}
