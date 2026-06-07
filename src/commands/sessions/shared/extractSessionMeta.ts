type SessionMeta = {
	sessionId: string;
	cwd: string;
	timestamp: string;
	name: string;
};

export function extractSessionMeta(lines: string[]): SessionMeta {
	let sessionId = "";
	let cwd = "";
	let timestamp = "";
	let name = "";

	for (const line of lines) {
		const entry = safeParse(line);
		if (!entry) continue;

		sessionId ||= typeof entry.sessionId === "string" ? entry.sessionId : "";
		timestamp ||= typeof entry.timestamp === "string" ? entry.timestamp : "";
		cwd ||= typeof entry.cwd === "string" ? entry.cwd : "";

		if (entry.type === "user" && !entry.isMeta) {
			name = extractName(entry);
			break;
		}
	}

	return { sessionId, cwd, timestamp, name };
}

function safeParse(line: string): Record<string, unknown> | null {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
}

function extractName(entry: Record<string, unknown>): string {
	const msg = entry.message as { content?: unknown } | undefined;
	const content = msg?.content;
	const text =
		typeof content === "string"
			? content
			: Array.isArray(content)
				? (content.find((c: { type?: string }) => c.type === "text")?.text ??
					"")
				: "";

	return text
		.replace(/<command-[^>]*>[^<]*<\/command-[^>]*>/g, "")
		.trim()
		.slice(0, 80);
}
