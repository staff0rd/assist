import * as fs from "node:fs";
import { parseUserLine, type UserLineEntry } from "./parseUserLine";

/**
 * Read a session JSONL file and yield each user message entry as
 * `{ text, entrypoint }`. Reads the entire file (no byte cap).
 */
export function* iterateUserEntries(
	filePath: string,
): Generator<UserLineEntry> {
	let content: string;
	try {
		content = fs.readFileSync(filePath, "utf8");
	} catch {
		return;
	}

	for (const line of content.split("\n")) {
		if (!line) continue;
		const entry = parseUserLine(line);
		if (entry) yield entry;
	}
}
