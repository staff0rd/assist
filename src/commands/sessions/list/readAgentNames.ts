import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../../shared/harnesses";

/* why: Claude Code registers each live session's peer name (what ListAgents
 * shows) in ~/.claude/sessions/<pid>.json, keyed by its conversation id. */
export function readAgentNames(
	dir = path.join(harnesses.claude.homeDir, "sessions"),
): Map<string, string> {
	const names = new Map<string, string>();
	let files: string[];
	try {
		files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
	} catch {
		return names;
	}
	for (const file of files) {
		try {
			const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
			if (typeof data.sessionId === "string" && typeof data.name === "string")
				names.set(data.sessionId, data.name);
		} catch {}
	}
	return names;
}
