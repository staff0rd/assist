import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

function getSnoreToastPath(): string {
	const notifierPath = path.dirname(require.resolve("node-notifier"));
	return path.join(notifierPath, "vendor", "snoreToast", "snoretoast-x64.exe");
}

type NotificationOptions = {
	title: string;
	message: string;
	sound?: string;
};

export function showWindowsNotificationFromWsl(
	options: NotificationOptions,
): boolean {
	const { title, message, sound } = options;

	const snoreToastPath = getSnoreToastPath();

	// Ensure executable permission
	try {
		fs.chmodSync(snoreToastPath, 0o755);
	} catch {
		// Ignore if already executable
	}

	const args = ["-t", title, "-m", message];
	if (sound) {
		args.push("-s", "ms-winsoundevent:Notification.Default");
	}

	const child = spawn(snoreToastPath, args, {
		detached: true,
		stdio: "ignore",
	});
	child.unref();
	return true;
}
