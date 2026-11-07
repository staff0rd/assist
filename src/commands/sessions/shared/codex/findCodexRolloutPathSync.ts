import * as fs from "node:fs";
import * as path from "node:path";
import { codexSessionsDir } from "./codexSessionsDir";

const DATE_DEPTH = 3;

export function findCodexRolloutPathSync(sessionId: string): string | null {
	if (!sessionId) return null;
	return findRollout(codexSessionsDir(), DATE_DEPTH, `-${sessionId}.jsonl`);
}

function findRollout(
	dir: string,
	depth: number,
	suffix: string,
): string | null {
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return null;
	}
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			const found = depth > 0 ? findRollout(full, depth - 1, suffix) : null;
			if (found) return found;
		} else if (entry.name.startsWith("rollout-") && entry.name.endsWith(suffix))
			return full;
	}
	return null;
}
