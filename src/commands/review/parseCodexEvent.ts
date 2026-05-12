import { simplifyShellCommand } from "./formatToolSummary";

type CodexEvent =
	| { kind: "tool_use"; tool: string; summary: string }
	| { kind: "ignore" };

type ItemStartedEvent = {
	type: "item.started";
	item?: { type?: unknown; command?: unknown };
};

function isItemStarted(value: unknown): value is ItemStartedEvent {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as { type?: unknown }).type === "item.started"
	);
}

export function parseCodexEvent(line: string): CodexEvent {
	let event: unknown;
	try {
		event = JSON.parse(line);
	} catch {
		return { kind: "ignore" };
	}
	if (!isItemStarted(event)) return { kind: "ignore" };
	const item = event.item;
	if (!item) return { kind: "ignore" };
	if (item.type === "command_execution" && typeof item.command === "string") {
		return {
			kind: "tool_use",
			tool: "shell",
			summary: simplifyShellCommand(item.command),
		};
	}
	return { kind: "ignore" };
}
