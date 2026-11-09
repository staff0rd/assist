import type { ConversationEvent } from "../../../shared/harnessAdapters/types";

const COMMIT_OUTPUT = [
	/^\[[^\]\n]+ ([0-9a-f]{7,40})\] /gm,
	/^Committed: ([0-9a-f]{7,40})$/gm,
];

export function parseTranscriptCommitShas(
	events: ConversationEvent[],
): string[] {
	const shas: string[] = [];
	for (const event of events) {
		if (event.kind !== "toolResult") continue;
		for (const pattern of COMMIT_OUTPUT) {
			for (const match of event.text.matchAll(pattern)) {
				if (!shas.includes(match[1])) shas.push(match[1]);
			}
		}
	}
	return shas;
}
