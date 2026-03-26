import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readStdin } from "../../lib/readStdin";

export async function showClaudeCodeIcon(): Promise<void> {
	const appData = process.env.APPDATA;
	if (!appData) return;

	const portFile = join(appData, "Roam", "roam-local-api.port");
	let port: string;
	try {
		port = readFileSync(portFile, "utf-8").trim();
	} catch {
		return;
	}

	const body = process.stdin.isTTY ? "{}" : await readStdin();

	try {
		await fetch(`http://localhost:${port}/api/v1/activity`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body,
		});
	} catch {
		// Silently fail — Roam may not be running
	}
}
