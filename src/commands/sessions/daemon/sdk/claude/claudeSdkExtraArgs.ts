import { loadConfigFrom } from "../../../../../shared/loadConfigFrom";
import { daemonLog } from "../../daemonLog";

function chromeEnabled(cwd: string, label: string): boolean {
	try {
		return loadConfigFrom(cwd).harness.claudeSdkChrome ?? true;
	} catch (error) {
		daemonLog(
			`${label} claude-sdk: config unreadable for cwd=${cwd}: ${error}`,
		);
		return true;
	}
}

export function claudeSdkExtraArgs(
	cwd: string,
	label: string,
): Record<string, string | null> {
	const chrome = chromeEnabled(cwd, label);
	daemonLog(
		`${label} claude-sdk: Claude in Chrome ${chrome ? "on (--chrome)" : "off"}`,
	);
	return chrome ? { chrome: null } : {};
}
