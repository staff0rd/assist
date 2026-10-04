import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { daemonLog } from "../daemonLog";

export function autoUpdateEnabled(installDir: string): boolean {
	try {
		return loadConfigFrom(installDir).autoUpdate?.enabled ?? true;
	} catch (error) {
		daemonLog(
			`auto-update: config failed to load, keeping the default (on): ${error instanceof Error ? error.message : String(error)}`,
		);
		return true;
	}
}
