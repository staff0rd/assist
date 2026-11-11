import { basename, dirname } from "node:path";
import { deriveCodexRolloutStatus } from "../../commands/sessions/shared/codex/deriveCodexRolloutStatus";
import { findCodexRolloutPathSync } from "../../commands/sessions/shared/codex/findCodexRolloutPathSync";
import {
	rolloutPayload,
	rolloutString,
} from "../../commands/sessions/shared/codex/parseRolloutEntry";
import { codexMessageEvents } from "./codexMessageEvents";
import { codexToolEvents } from "./codexToolEvents";
import { codexUnrecognisedShapes } from "./codexUnrecognisedShapes";
import type { ConversationEvent, ConversationReader } from "./types";

type Entry = Record<string, unknown>;

function entryEvents(entry: Entry): ConversationEvent[] {
	const payload = rolloutPayload(entry);
	const at = typeof entry.timestamp === "string" ? entry.timestamp : undefined;
	if (entry.type === "event_msg") return codexMessageEvents(payload, at);
	if (entry.type === "response_item") return codexToolEvents(payload, at);
	return [];
}

function fingerprint(entries: Entry[]): string | null {
	for (let i = entries.length - 1; i >= 0; i--) {
		const entry = entries[i];
		if (entry.type !== "event_msg" && entry.type !== "response_item") continue;
		const payload = rolloutPayload(entry);
		return [
			rolloutString(entry.timestamp),
			rolloutString(payload.type),
			rolloutString(payload.id) || rolloutString(payload.call_id),
		].join("|");
	}
	return null;
}

export const codexConversationReader: ConversationReader = {
	headBytes: 2 * 1024 * 1024,
	locate: ({ harnessSessionId }) =>
		harnessSessionId ? findCodexRolloutPathSync(harnessSessionId) : null,
	watchTarget: (ref) => {
		const path = codexConversationReader.locate(ref);
		return path ? { dir: dirname(path), file: basename(path) } : null;
	},
	events: (entries) => entries.flatMap(entryEvents),
	lifecycle: (entries) => ({
		status: deriveCodexRolloutStatus(entries),
		asking: false,
	}),
	fingerprint,
	unrecognised: codexUnrecognisedShapes,
};
