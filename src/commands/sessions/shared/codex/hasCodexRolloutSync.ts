import * as fs from "node:fs";
import * as path from "node:path";
import { codexSessionsDir } from "./codexSessionsDir";

const DATE_DEPTH = 3;

export function hasCodexRolloutSync(sessionId: string): boolean {
	if (!sessionId) return false;
	return containsRollout(codexSessionsDir(), DATE_DEPTH, `-${sessionId}.jsonl`);
}

function containsRollout(dir: string, depth: number, suffix: string): boolean {
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return false;
	}
	return entries.some((entry) =>
		entry.isDirectory()
			? depth > 0 &&
				containsRollout(path.join(dir, entry.name), depth - 1, suffix)
			: entry.name.startsWith("rollout-") && entry.name.endsWith(suffix),
	);
}
