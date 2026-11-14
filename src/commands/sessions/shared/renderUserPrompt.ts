import { renderPrompt } from "./renderPrompt";
import { userPromptRaw } from "./userPromptRaw";

const MAX_LENGTH = 2048;

type RawEntry = Record<string, unknown>;

export function renderUserPrompt(
	entry: RawEntry,
	maxLength = MAX_LENGTH,
): string | undefined {
	const raw = userPromptRaw(entry);
	if (raw === null) return undefined;
	const message = renderPrompt(raw);
	return message ? cap(message, maxLength) : undefined;
}

function cap(message: string, maxLength: number): string {
	return message.length <= maxLength
		? message
		: `${message.slice(0, maxLength).trimEnd()}…`;
}
