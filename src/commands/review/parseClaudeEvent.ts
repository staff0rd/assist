import { formatToolSummary } from "./formatToolSummary";

type ClaudeToolUse = { tool: string; summary: string };

type ClaudeEvent =
	| { kind: "tool_uses"; toolUses: ClaudeToolUse[] }
	| { kind: "final"; text: string }
	| { kind: "ignore" };

type ContentBlock =
	| { type: "tool_use"; name?: unknown; input?: unknown }
	| { type: string };

type AssistantEvent = {
	type: "assistant";
	message?: { content?: ContentBlock[] };
};

type ResultEvent = {
	type: "result";
	result?: unknown;
};

function isAssistantEvent(value: unknown): value is AssistantEvent {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as { type?: unknown }).type === "assistant"
	);
}

function isResultEvent(value: unknown): value is ResultEvent {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as { type?: unknown }).type === "result"
	);
}

function extractToolUses(event: AssistantEvent): ClaudeToolUse[] {
	const content = event.message?.content ?? [];
	const uses: ClaudeToolUse[] = [];
	for (const block of content) {
		if (block.type !== "tool_use") continue;
		const named = block as { name?: unknown; input?: unknown };
		const name = typeof named.name === "string" ? named.name : "tool";
		uses.push({ tool: name, summary: formatToolSummary(named.input) });
	}
	return uses;
}

export function parseClaudeEvent(line: string): ClaudeEvent {
	let event: unknown;
	try {
		event = JSON.parse(line);
	} catch {
		return { kind: "ignore" };
	}
	if (isAssistantEvent(event)) {
		const toolUses = extractToolUses(event);
		if (toolUses.length > 0) return { kind: "tool_uses", toolUses };
	}
	if (isResultEvent(event) && typeof event.result === "string") {
		return { kind: "final", text: event.result };
	}
	return { kind: "ignore" };
}
