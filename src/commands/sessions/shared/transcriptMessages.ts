import type { ConversationReader } from "../../../shared/harnessAdapters/types";
import { parseRolloutEntry } from "./codex/parseRolloutEntry";

export type TranscriptMessage =
	| { role: "user"; text: string }
	| { role: "assistant"; text: string }
	| { role: "tool"; tool: string; target: string }
	| { role: "interrupt" };

export function transcriptMessages(
	reader: ConversationReader,
	lines: string[],
): TranscriptMessage[] {
	const entries = lines.flatMap((line) => {
		const entry = line.trim() ? parseRolloutEntry(line) : null;
		return entry ? [entry as Record<string, unknown>] : [];
	});
	return reader.events(entries).flatMap((event): TranscriptMessage[] => {
		if (event.kind === "message")
			return [{ role: event.role, text: event.text }];
		if (event.kind === "tool")
			return [{ role: "tool", tool: event.tool, target: event.target }];
		if (event.kind === "interrupt") return [{ role: "interrupt" }];
		return [];
	});
}
