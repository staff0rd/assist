import { readStdin } from "../../lib/readStdin";
import { loadConfig } from "../../shared/loadConfig";
import { showNotification } from "./showNotification";

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

	let title: string;
	let body: string;
	let sound: string;

	switch (notification_type) {
		case "permission_prompt":
			title = "Claude needs permission";
			body = `${projectName} - ${message || "Permission required"}`;
			sound = "Alarm";
			break;
		case "idle_prompt":
			title = "Claude is waiting";
			body = `${projectName} - Waiting for your input`;
			sound = "Reminder";
			break;
		default:
			title = "Claude Code";
			body = message ? `${projectName} - ${message}` : projectName;
			sound = "Default";
	}

	showNotification({ title, message: body, sound });
	console.log(`Notification sent: ${notification_type} for ${projectName}`);
}
