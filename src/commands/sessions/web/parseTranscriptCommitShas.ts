const COMMIT_OUTPUT = [
	/^\[[^\]\n]+ ([0-9a-f]{7,40})\] /gm,
	/^Committed: ([0-9a-f]{7,40})$/gm,
];

type ToolResultBlock = { type?: string; content?: unknown };

export function parseTranscriptCommitShas(transcript: string): string[] {
	const shas: string[] = [];
	for (const line of transcript.split("\n")) {
		for (const text of toolResultTexts(line)) {
			for (const pattern of COMMIT_OUTPUT) {
				for (const match of text.matchAll(pattern)) {
					if (!shas.includes(match[1])) shas.push(match[1]);
				}
			}
		}
	}
	return shas;
}

function toolResultTexts(line: string): string[] {
	if (!line.includes('"tool_result"')) return [];
	try {
		const entry = JSON.parse(line) as {
			message?: { content?: ToolResultBlock[] | string };
		};
		const content = entry.message?.content;
		if (!Array.isArray(content)) return [];
		return content
			.filter((block) => block?.type === "tool_result")
			.map((block) => resultText(block.content));
	} catch {
		return [];
	}
}

function resultText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.map((part) =>
			part && typeof part === "object" && "text" in part
				? String(part.text)
				: "",
		)
		.join("\n");
}
