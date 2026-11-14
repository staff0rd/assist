import { parseRestartNudge } from "./parseRestartNudge";

const INTERRUPT_PREFIX = "[Request interrupted";

type RawEntry = Record<string, unknown>;

export function userPromptRaw(entry: RawEntry): string | null {
	if (entry.isSidechain || entry.isMeta) return null;
	if (entry.type !== "user" || isTaskNotification(entry)) return null;
	const raw = promptTextOrNull(entry);
	if (raw === null || parseRestartNudge(raw) !== null) return null;
	return raw;
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

function isInterrupt(value: string): boolean {
	return value.trimStart().startsWith(INTERRUPT_PREFIX);
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: null;
}
