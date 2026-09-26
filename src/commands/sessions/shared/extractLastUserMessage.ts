import { renderUserPrompt } from "./renderUserPrompt";

export function extractLastUserMessage(
	entries: Record<string, unknown>[],
	maxLength?: number,
): string | undefined {
	for (let i = entries.length - 1; i >= 0; i--) {
		const message = renderUserPrompt(entries[i], maxLength);
		if (message) return message;
	}
	return undefined;
}
