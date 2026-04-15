import * as fs from "node:fs";

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
		let entry: Record<string, unknown>;
		try {
			entry = JSON.parse(line);
		} catch {
			continue;
		}
		if (entry.type !== "user") continue;

		const msg = entry.message as { content?: unknown } | undefined;
		const c = msg?.content;
		if (typeof c === "string") {
			yield c;
		} else if (Array.isArray(c)) {
			const text = c
				.filter((b: { type?: string }) => b.type === "text")
				.map((b: { text?: string }) => b.text ?? "")
				.join("\n");
			if (text) yield text;
		}
	}
}
