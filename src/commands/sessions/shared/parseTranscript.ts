import * as fs from "node:fs";
import { entryMessages, type TranscriptMessage } from "./entryMessages";
import { findSessionJsonlPath } from "./findSessionJsonlPath";

export async function parseTranscript(
	sessionId: string,
): Promise<TranscriptMessage[]> {
	const filePath = await findSessionJsonlPath(sessionId);
	if (!filePath) return [];
	try {
		const raw = await fs.promises.readFile(filePath, "utf8");
		return parseTranscriptLines(raw.split("\n"));
	} catch {
		return [];
	}
}

export function parseTranscriptLines(lines: string[]): TranscriptMessage[] {
	const messages: TranscriptMessage[] = [];
	for (const line of lines) {
		const entry = line.trim() ? safeParse(line) : null;
		if (!entry || entry.isSidechain || entry.isMeta) continue;
		messages.push(...entryMessages(entry));
	}
	return messages;
}

function safeParse(line: string): Record<string, unknown> | null {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
}
