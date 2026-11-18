type RolloutLine = { type?: unknown; payload?: unknown };

const CWD_ENTRIES = new Set(["session_meta", "turn_context"]);

function replaceCwd(value: unknown, from: string, to: string): unknown {
	if (value === from) return to;
	if (Array.isArray(value)) return value.map((v) => replaceCwd(v, from, to));
	if (value && typeof value === "object")
		return Object.fromEntries(
			Object.entries(value).map(([k, v]) => [k, replaceCwd(v, from, to)]),
		);
	return value;
}

function parse(line: string): RolloutLine | undefined {
	try {
		const parsed: unknown = JSON.parse(line);
		return parsed && typeof parsed === "object"
			? (parsed as RolloutLine)
			: undefined;
	} catch {
		return undefined;
	}
}

function sourceCwd(lines: string[]): string | undefined {
	for (const line of lines) {
		const entry = parse(line);
		if (entry?.type !== "session_meta") continue;
		const cwd = (entry.payload as { cwd?: unknown } | undefined)?.cwd;
		return typeof cwd === "string" ? cwd : undefined;
	}
	return undefined;
}

export function relocateCodexRollout(
	transcript: string,
	toCwd: string,
): string {
	const lines = transcript.split("\n");
	const from = sourceCwd(lines);
	if (!from || from === toCwd) return transcript;
	return lines
		.map((line) => {
			const entry = parse(line);
			if (!entry || !CWD_ENTRIES.has(entry.type as string)) return line;
			return JSON.stringify({
				...entry,
				payload: replaceCwd(entry.payload, from, toCwd),
			});
		})
		.join("\n");
}
