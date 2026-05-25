import * as fs from "node:fs";
import { parseUserLine } from "./parseUserLine";

/**
 * Read a session JSONL file and yield the text of each user message.
 * Reads up to `maxBytes` from the start of the file (default 64KB).
 */
export function* iterateUserMessages(
	filePath: string,
	maxBytes = 65_536,
): Generator<string> {
	let content: string;
	try {
		const fd = fs.openSync(filePath, "r");
		try {
			const buf = Buffer.alloc(maxBytes);
			const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
			content = buf.toString("utf8", 0, bytesRead);
		} finally {
			fs.closeSync(fd);
		}
	} catch {
		return;
	}

	for (const line of content.split("\n")) {
		if (!line) continue;
		const entry = parseUserLine(line);
		if (entry) yield entry.text;
	}
}
