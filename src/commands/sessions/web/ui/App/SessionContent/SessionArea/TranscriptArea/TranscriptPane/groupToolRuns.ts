import type { TranscriptMessage } from "../../../../../types";

type KeyedMessage = TranscriptMessage & { key: string };
export type KeyedToolMessage = Extract<TranscriptMessage, { role: "tool" }> & {
	key: string;
};

type TranscriptItem =
	| { kind: "message"; message: KeyedMessage }
	| { kind: "tools"; key: string; calls: KeyedToolMessage[] };

function messageKey(m: TranscriptMessage): string {
	if (m.role === "tool") return `tool:${m.tool}:${m.target}`;
	if (m.role === "interrupt") return "interrupt";
	if (m.role === "restart") return "restart";
	return `${m.role}:${m.text.slice(0, 40)}`;
}

function withKeys(messages: TranscriptMessage[]): KeyedMessage[] {
	const counts = new Map<string, number>();
	return messages.map((m) => {
		const base = messageKey(m);
		const n = counts.get(base) ?? 0;
		counts.set(base, n + 1);
		return { ...m, key: `${base}#${n}` };
	});
}

export function groupToolRuns(messages: TranscriptMessage[]): TranscriptItem[] {
	const items: TranscriptItem[] = [];
	for (const m of withKeys(messages)) {
		if (m.role !== "tool") {
			items.push({ kind: "message", message: m });
			continue;
		}
		const last = items.at(-1);
		if (last?.kind === "tools") last.calls.push(m);
		else items.push({ kind: "tools", key: `run:${m.key}`, calls: [m] });
	}
	return items;
}
