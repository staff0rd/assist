import { backlogRunMarkers } from "./backlogRunMarkers";

export function parseFirstUserEntry(entry: Record<string, unknown>): {
	name: string;
	commandName: string;
	commandArgs: string;
} {
	const raw = messageText(entry);
	const commandName = matchMarker(raw, "command-name").replace(/^\//, "");
	const commandArgs = matchMarker(raw, "command-args");
	const name = stripMarkers(raw);
	if (commandName) return { name, commandName, commandArgs };
	return { name, ...backlogRunMarkers(raw) };
}

function messageText(entry: Record<string, unknown>): string {
	const msg = entry.message as { content?: unknown } | undefined;
	const content = msg?.content;
	return typeof content === "string"
		? content
		: Array.isArray(content)
			? (content.find((c: { type?: string }) => c.type === "text")?.text ?? "")
			: "";
}

function matchMarker(text: string, tag: string): string {
	const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
	return match ? match[1].trim() : "";
}

function stripMarkers(text: string): string {
	return text
		.replace(/<command-[^>]*>[^<]*<\/command-[^>]*>/g, "")
		.trim()
		.slice(0, 80);
}
