import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function postRoamActivity(app: string, event: string): void {
	const appData = process.env.APPDATA;
	if (!appData) return;

	const portFile = join(appData, "Roam", "roam-local-api.port");
	let port: string;
	try {
		port = readFileSync(portFile, "utf-8").trim();
	} catch {
		return;
	}

	const url = `http://127.0.0.1:${port}/api/v1/activity/${app}/${event}?pid=${app === "codex" ? 99998 : 99999}`;

	try {
		execFileSync("curl", ["-sf", "--max-time", "0.2", "-X", "POST", url], {
			stdio: "ignore",
		});
	} catch {
		// Silently fail — Roam may not be running
	}
}
