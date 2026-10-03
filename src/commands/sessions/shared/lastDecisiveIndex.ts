import type { TranscriptEvent } from "./TranscriptEvent";

const NON_DECISIVE_KINDS = new Set<TranscriptEvent["kind"]>([
	"toolResult",
	"taskNotification",
]);

export function lastDecisiveIndex(events: TranscriptEvent[]): number {
	for (let i = events.length - 1; i >= 0; i--)
		if (!NON_DECISIVE_KINDS.has(events[i].kind)) return i;
	return -1;
}
