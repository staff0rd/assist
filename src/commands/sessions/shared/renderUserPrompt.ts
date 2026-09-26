import { renderPrompt } from "./renderPrompt";

const MAX_LENGTH = 2048;
const INTERRUPT_PREFIX = "[Request interrupted";

type RawEntry = Record<string, unknown>;

export function renderUserPrompt(
	entry: RawEntry,
	maxLength = MAX_LENGTH,
): string | undefined {
	if (entry.isSidechain || entry.isMeta) return undefined;
	if (entry.type !== "user" || isTaskNotification(entry)) return undefined;
	const raw = promptTextOrNull(entry);
	if (raw === null) return undefined;
	const message = renderPrompt(raw);
	return message ? cap(message, maxLength) : undefined;
}

function isTaskNotification(entry: RawEntry): boolean {
	return asRecord(entry.origin)?.kind === "task-notification";
}

function promptTextOrNull(entry: RawEntry): string | null {
	const content = asRecord(entry.message)?.content;
	if (typeof content === "string") return isInterrupt(content) ? null : content;
	if (!Array.isArray(content)) return null;

	const parts: string[] = [];
	for (const block of content) {
		const b = asRecord(block);
		if (b?.type !== "text") continue;
		const text = typeof b.text === "string" ? b.text : "";
		if (isInterrupt(text)) return null;
		parts.push(text);
	}
	return parts.length === 0 ? null : parts.join("\n");
}

function cap(message: string, maxLength: number): string {
	return message.length <= maxLength
		? message
		: `${message.slice(0, maxLength).trimEnd()}…`;
}

function isInterrupt(value: string): boolean {
	return value.trimStart().startsWith(INTERRUPT_PREFIX);
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: null;
}
