import { existsSync, readFileSync } from "node:fs";
import { voicePaths } from "./shared";

export function logs(options: { lines?: string }): void {
	if (!existsSync(voicePaths.log)) {
		console.log("No voice log file found");
		return;
	}

	const count = Number.parseInt(options.lines ?? "20", 10);
	const content = readFileSync(voicePaths.log, "utf-8").trim();

	if (!content) {
		console.log("Voice log is empty");
		return;
	}

	const lines = content.split("\n").slice(-count);

	for (const line of lines) {
		try {
			const event = JSON.parse(line);
			const time = event.timestamp?.slice(11, 19) ?? "";
			const level = (event.level ?? "info").toUpperCase().padEnd(5);
			const msg = event.message ?? "";
			const extra = event.data ? ` ${JSON.stringify(event.data)}` : "";
			console.log(`${time} ${level} [${event.event}] ${msg}${extra}`);
		} catch {
			console.log(line);
		}
	}
}
