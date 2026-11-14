import type {
	ConversationEvent,
	ConversationReader,
} from "../../../shared/harnessAdapters/types";
import { parseRolloutEntry } from "./codex/parseRolloutEntry";

export type TranscriptMessage =
	| { role: "user"; text: string }
	| { role: "assistant"; text: string }
	| { role: "tool"; tool: string; target: string; description?: string }
	| { role: "interrupt" };

export type TranscriptEcho = { at: string; text: string };

function toMessages(event: ConversationEvent): TranscriptMessage[] {
	if (event.kind === "message") return [{ role: event.role, text: event.text }];
	if (event.kind === "tool")
		return [
			{
				role: "tool",
				tool: event.tool,
				target: event.target,
				...(event.description && { description: event.description }),
			},
		];
	if (event.kind === "interrupt") return [{ role: "interrupt" }];
	return [];
}

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
			...toMessages(event),
		]);
	return [...messages, ...echoMessages(pending)];
}
