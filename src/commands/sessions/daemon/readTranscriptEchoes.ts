import { readFile } from "node:fs/promises";
import type { TranscriptEcho } from "../shared/transcriptMessages";
import { transcriptEchoPath } from "./transcriptEchoPath";

function parseEcho(line: string): TranscriptEcho[] {
	try {
		const echo = JSON.parse(line) as Partial<TranscriptEcho>;
		return typeof echo.at === "string" &&
			typeof echo.text === "string" &&
			typeof echo.command === "string"
			? [{ at: echo.at, command: echo.command, text: echo.text }]
			: [];
	} catch {
		return [];
	}
}

export async function readTranscriptEchoes(
	conversationId: string,
): Promise<TranscriptEcho[]> {
	try {
		const raw = await readFile(transcriptEchoPath(conversationId), "utf8");
		return raw
			.split("\n")
			.flatMap((line) => (line.trim() ? parseEcho(line) : []));
	} catch {
		return [];
	}
}
