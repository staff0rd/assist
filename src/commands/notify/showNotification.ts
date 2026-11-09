import notifier from "node-notifier";
import { activeHarness } from "../../lib/activeHarness";
import { detectPlatform } from "../../lib/detectPlatform";
import { harnessProductLabel } from "../../shared/harnessLabel";
import { showWindowsNotificationFromWsl } from "./showNotification/showWindowsNotificationFromWsl";

type NotificationOptions = {
	title: string;
	message: string;
	sound?: string;
};

type NotifierOptions = notifier.Notification & {
	appID?: string;
	sound?: string;
	timeout?: number | false;
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
		notificationOptions.appID = harnessProductLabel(activeHarness());
	}

	if (platform === "macos") {
		notificationOptions.sound = sound === "Alarm" ? "Basso" : "Submarine";
		notificationOptions.timeout = false;
	}

	notifier.notify(notificationOptions);
	return true;
}
