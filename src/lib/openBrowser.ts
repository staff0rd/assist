import { execSync } from "node:child_process";
import { detectPlatform } from "./detectPlatform";

function tryExec(commands: string[]): boolean {
	for (const cmd of commands) {
		try {
			execSync(cmd);
			return true;
		} catch {
			// try next
		}
	}
	return false;
}

export function openBrowser(url: string): void {
	const platform = detectPlatform();
	const quoted = JSON.stringify(url);

	const commands: string[] = [];
	switch (platform) {
		case "macos":
			commands.push(
				`open -a "Google Chrome" ${quoted}`,
				`open -a "Microsoft Edge" ${quoted}`,
				`open -a "Safari" ${quoted}`,
			);
			break;
		case "linux":
			commands.push(
				`google-chrome ${quoted}`,
				`chromium-browser ${quoted}`,
				`microsoft-edge ${quoted}`,
			);
			break;
		case "windows":
			commands.push(`start chrome ${quoted}`, `start msedge ${quoted}`);
			break;
		case "wsl":
			commands.push(`wslview ${quoted}`);
			break;
	}

	if (!tryExec(commands)) {
		console.log(`Open this URL in Chrome, Edge, or Safari:\n${url}`);
	}
}
