import { parseFirstUserEntry } from "./parseFirstUserEntry";

type SessionMeta = {
	sessionId: string;
	cwd: string;
	timestamp: string;
	name: string;
	commandName: string;
	commandArgs: string;
	reachedFirstPrompt: boolean;
};

export function extractSessionMeta(lines: string[]): SessionMeta {
	let reachedFirstPrompt = false;
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
			reachedFirstPrompt = true;
			break;
		}
	}

	return {
		sessionId,
		cwd,
		timestamp,
		name,
		commandName,
		commandArgs,
		reachedFirstPrompt,
	};
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
