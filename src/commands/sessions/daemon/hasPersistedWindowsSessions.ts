import { existsSync, readFileSync } from "node:fs";
import { posix } from "node:path";
import { loadConfig } from "../../../shared/loadConfig";
import { daemonLog } from "./daemonLog";

export function hasPersistedWindowsSessions(): boolean {
	const sessionsFile = windowsSessionsFileFromWsl();
	if (!sessionsFile) return false;
	try {
		if (!existsSync(sessionsFile)) return false;
		const data = JSON.parse(readFileSync(sessionsFile, "utf8"));
		return Array.isArray(data) && data.length > 0;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		daemonLog(
			`windows proxy: could not read windows sessions.json: ${message}`,
		);
		return false;
	}
}

function windowsSessionsFileFromWsl(): string | null {
	const projectsRootUnderWinHome = loadConfig().sessions?.windowsProjectsRoot;
	if (!projectsRootUnderWinHome) return null;
	const winHome = posix.dirname(posix.dirname(projectsRootUnderWinHome));
	return posix.join(winHome, ".assist", "sessions.json");
}
