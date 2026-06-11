import { toolTarget } from "./toolTarget";

export type TranscriptMessage =
	| { role: "user"; text: string }
	| { role: "assistant"; text: string }
	| { role: "tool"; tool: string; target: string };

type Content = { type?: string; text?: string; name?: string; input?: unknown };

/** Convert one JSONL entry into the transcript messages it contributes. */
export function entryMessages(
	entry: Record<string, unknown>,
): TranscriptMessage[] {
	const content = (entry.message as { content?: unknown } | undefined)?.content;
	if (entry.type === "user") return userMessages(content);
	if (entry.type === "assistant") return assistantMessages(content);
	return [];
}

function userMessages(content: unknown): TranscriptMessage[] {
	if (typeof content === "string") return text("user", cleanUserText(content));
	if (!Array.isArray(content)) return [];
	return content
		.filter((c: Content) => c.type === "text")
		.flatMap((c: Content) => text("user", cleanUserText(c.text ?? "")));
}

function assistantMessages(content: unknown): TranscriptMessage[] {
	if (typeof content === "string") return text("assistant", content.trim());
	if (!Array.isArray(content)) return [];
	return content.flatMap((c: Content) => assistantItem(c));
}

function assistantItem(c: Content): TranscriptMessage[] {
	if (c.type === "text") return text("assistant", (c.text ?? "").trim());
	if (c.type === "tool_use")
		return [
			{
				role: "tool",
				tool: typeof c.name === "string" ? c.name : "tool",
				target: toolTarget(c.input),
			},
		];
	return [];
}

function text(role: "user" | "assistant", value: string): TranscriptMessage[] {
	return value ? [{ role, text: value }] : [];
}

function cleanUserText(value: string): string {
	return value
		.replace(/<command-[^>]*>[\s\S]*?<\/command-[^>]*>/g, "")
		.replace(/<local-command-[^>]*>[\s\S]*?<\/local-command-[^>]*>/g, "")
		.trim();
}
