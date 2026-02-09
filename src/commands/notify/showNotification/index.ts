import notifier from "node-notifier";
import { detectPlatform } from "../../../lib/detectPlatform";
import { showWindowsNotificationFromWsl } from "./showWindowsNotificationFromWsl";

type NotificationOptions = {
	title: string;
	message: string;
	sound?: string;
};

type NotifierOptions = notifier.Notification & {
	appID?: string;
	sound?: string;
	timeout?: number;
};

export function showNotification(options: NotificationOptions): boolean {
	const { title, message, sound } = options;
	const platform = detectPlatform();

	if (platform === "wsl") {
		return showWindowsNotificationFromWsl({ title, message, sound });
	}

	const notificationOptions: NotifierOptions = {
		title,
		message,
		wait: false,
	};

	if (platform === "windows") {
		notificationOptions.appID = "Claude Code";
	}

	if (platform === "macos") {
		notificationOptions.sound = sound === "Alarm" ? "Basso" : "Submarine";
		notificationOptions.timeout = 99999999999;
		notificationOptions.wait = true;
	}

	notifier.notify(notificationOptions);
	return true;
}
