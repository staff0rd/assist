import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../../../shared/harnesses";

function parseLine(line: string): Record<string, unknown> | null {
	try {
		const entry: unknown = JSON.parse(line);
		return entry && typeof entry === "object"
			? (entry as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

export function transcriptLineTexts(
	line: string,
	harness: HarnessKind | undefined,
): string[] {
	const reader = harnessAdapter(harness).conversation.reader;
	const entry = parseLine(line);
	if (!reader || !entry) return [];
	return reader
		.events([entry])
		.flatMap((event) => (event.kind === "message" ? [event.text] : []));
}
