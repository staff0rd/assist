import { codexConversationReader } from "../../../../shared/harnessAdapters/codexConversationReader";
import type { TranscriptMessage } from "../entryMessages";
import { parseRolloutEntry } from "./parseRolloutEntry";

export function parseCodexTranscriptLines(
	lines: string[],
): TranscriptMessage[] {
	const entries = lines.flatMap((line) => {
		const entry = line.trim() ? parseRolloutEntry(line) : null;
		return entry ? [entry as Record<string, unknown>] : [];
	});
	return codexConversationReader
		.events(entries)
		.flatMap((event): TranscriptMessage[] => {
			if (event.kind === "message")
				return [{ role: event.role, text: event.text }];
			if (event.kind === "tool")
				return [{ role: "tool", tool: event.tool, target: event.target }];
			return [];
		});
}
