import type { ConversationReader } from "../../../shared/harnessAdapters/types";
import { parseRolloutEntry } from "./codex/parseRolloutEntry";
import { eventTranscriptMessages } from "./eventTranscriptMessages";
import type { TranscriptMessage } from "./TranscriptMessage";

export type { TranscriptMessage };

export type TranscriptEcho = { at: string; text: string };

function echoMessages(
	pending: TranscriptEcho[],
	until?: string,
): TranscriptMessage[] {
	const due: TranscriptMessage[] = [];
	while (pending.length && (until === undefined || pending[0].at < until))
		due.push({ role: "user", text: (pending.shift() as TranscriptEcho).text });
	return due;
}

export function transcriptMessages(
	reader: ConversationReader,
	lines: string[],
	echoes: TranscriptEcho[] = [],
): TranscriptMessage[] {
	const entries = lines.flatMap((line) => {
		const entry = line.trim() ? parseRolloutEntry(line) : null;
		return entry ? [entry as Record<string, unknown>] : [];
	});
	const pending = [...echoes].sort((a, b) => a.at.localeCompare(b.at));
	const messages = reader
		.events(entries)
		.flatMap((event) => [
			...(event.at ? echoMessages(pending, event.at) : []),
			...eventTranscriptMessages(event),
		]);
	return [...messages, ...echoMessages(pending)];
}
