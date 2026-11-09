import type {
	ConversationEvent,
	ConversationReader,
} from "../../../shared/harnessAdapters/types";
import { readTranscriptHead } from "../summarise/readTranscriptHead";

function parseLine(line: string): Record<string, unknown>[] {
	try {
		const parsed: unknown = JSON.parse(line);
		return parsed && typeof parsed === "object"
			? [parsed as Record<string, unknown>]
			: [];
	} catch {
		return [];
	}
}

export function readConversationHead(
	reader: ConversationReader,
	filePath: string,
	maxBytes = reader.headBytes,
): ConversationEvent[] | undefined {
	const head = readTranscriptHead(filePath, maxBytes);
	if (head === undefined) return undefined;
	return reader.events(
		head.split("\n").flatMap((line) => (line ? parseLine(line) : [])),
	);
}
