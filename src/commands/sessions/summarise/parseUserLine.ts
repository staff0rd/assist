export type UserLineEntry = {
	text: string;
	entrypoint?: string;
};

export function parseUserLine(line: string): UserLineEntry | undefined {
	let entry: Record<string, unknown>;
	try {
		entry = JSON.parse(line);
	} catch {
		return undefined;
	}
	if (entry.type !== "user") return undefined;

	const msg = entry.message as { content?: unknown } | undefined;
	const c = msg?.content;
	let text: string | undefined;
	if (typeof c === "string") {
		text = c;
	} else if (Array.isArray(c)) {
		const collected = c
			.filter((b: { type?: string }) => b.type === "text")
			.map((b: { text?: string }) => b.text ?? "")
			.join("\n");
		text = collected || undefined;
	}
	if (!text) return undefined;

	return {
		text,
		entrypoint:
			typeof entry.entrypoint === "string" ? entry.entrypoint : undefined,
	};
}
