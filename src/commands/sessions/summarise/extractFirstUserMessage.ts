import { iterateUserMessages } from "./iterateUserMessages";

/**
 * Extract the first user message from a session JSONL file.
 * Reads only enough of the file to find the first user message (up to 64KB).
 */
export function extractFirstUserMessage(filePath: string): string | undefined {
	for (const text of iterateUserMessages(filePath)) {
		return truncate(text);
	}
	return undefined;
}

function truncate(text: string, maxChars = 500): string {
	const trimmed = text.trim();
	if (trimmed.length <= maxChars) return trimmed;
	return `${trimmed.slice(0, maxChars)}…`;
}
