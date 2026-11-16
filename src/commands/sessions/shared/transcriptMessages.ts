import type {
	ConversationEvent,
	ConversationReader,
} from "../../../shared/harnessAdapters/types";
import { parseRolloutEntry } from "./codex/parseRolloutEntry";
import { eventTranscriptMessages } from "./eventTranscriptMessages";
import type { TranscriptMessage } from "./TranscriptMessage";

export type { TranscriptMessage };

export type TranscriptEcho = { at: string; command: string; text: string };

/* why: a pane reply is recorded at decision time, before its deferred result
 * is delivered, so the delivered message is the first of that command's
 * results at or after the reply. A reply's command may be just the leading
 * words of the delivered label (e.g. `backlog` for `backlog add-phase a1`). Older unclaimed replies for the command
 * (e.g. their session ended before delivery) are dropped so they never
 * replace a later result. */
function claimReply(
	replies: TranscriptEcho[],
	event: ConversationEvent,
): TranscriptEcho | undefined {
	if (event.kind !== "message" || event.role !== "user" || !event.at) return;
	const at = event.at;
	const label = /^`assist ([^`]+)` finished with exit code /.exec(
		event.text,
	)?.[1];
	if (!label) return;
	const matching = replies.filter(
		(reply) =>
			reply.at <= at &&
			(label === reply.command || label.startsWith(`${reply.command} `)),
	);
	const reply = matching.at(-1);
	if (!reply) return;
	for (const claimed of matching) replies.splice(replies.indexOf(claimed), 1);
	return reply;
}

export function transcriptMessages(
	reader: ConversationReader,
	lines: string[],
	replies: TranscriptEcho[] = [],
): TranscriptMessage[] {
	const entries = lines.flatMap((line) => {
		const entry = line.trim() ? parseRolloutEntry(line) : null;
		return entry ? [entry as Record<string, unknown>] : [];
	});
	const unclaimed = [...replies].sort((a, b) => a.at.localeCompare(b.at));
	return reader.events(entries).flatMap((event): TranscriptMessage[] => {
		const reply = claimReply(unclaimed, event);
		if (reply && event.kind === "message")
			return [{ role: "user", text: reply.text, sent: event.text }];
		return eventTranscriptMessages(event);
	});
}
