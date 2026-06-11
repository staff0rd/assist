import { backlogRunMarkers } from "./backlogRunMarkers";

type SessionMeta = {
	sessionId: string;
	cwd: string;
	timestamp: string;
	name: string;
	commandName: string;
	commandArgs: string;
};

export function extractSessionMeta(lines: string[]): SessionMeta {
	let sessionId = "";
	let cwd = "";
	let timestamp = "";
	let name = "";
	let commandName = "";
	let commandArgs = "";

	for (const line of lines) {
		const entry = safeParse(line);
		if (!entry) continue;

		sessionId ||= strField(entry, "sessionId");
		timestamp ||= strField(entry, "timestamp");
		cwd ||= strField(entry, "cwd");

		if (entry.type === "user" && !entry.isMeta) {
			({ name, commandName, commandArgs } = parseFirstUserEntry(entry));
			break;
		}
	}

	return { sessionId, cwd, timestamp, name, commandName, commandArgs };
}

function parseFirstUserEntry(entry: Record<string, unknown>): {
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

function strField(entry: Record<string, unknown>, key: string): string {
	const value = entry[key];
	return typeof value === "string" ? value : "";
}

function safeParse(line: string): Record<string, unknown> | null {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
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

function stripMarkers(text: string): string {
	return text
		.replace(/<command-[^>]*>[^<]*<\/command-[^>]*>/g, "")
		.trim()
		.slice(0, 80);
}

function matchMarker(text: string, tag: string): string {
	const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
	return match ? match[1].trim() : "";
}
