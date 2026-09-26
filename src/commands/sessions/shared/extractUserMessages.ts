import { renderUserPrompt } from "./renderUserPrompt";

export function extractUserMessages(
	entries: Record<string, unknown>[],
	maxLength?: number,
): string[] {
	const messages: string[] = [];
	for (const entry of entries) {
		const message = renderUserPrompt(entry, maxLength);
		if (message) messages.push(message);
	}
	return messages;
}
