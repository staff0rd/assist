import { loadConfigFrom } from "../../../../../shared/loadConfigFrom";
import { daemonLog } from "../../daemonLog";

export function claudeSdkExtraArgs(
	cwd: string,
	sessionLabel: string,
): Record<string, string | null> {
	const chrome = loadConfigFrom(cwd).harness.claudeSdkChrome ?? true;
	daemonLog(
		`claude-sdk ${sessionLabel}: Claude in Chrome ${chrome ? "on (--chrome)" : "off"}`,
	);
	return chrome ? { chrome: null } : {};
}
