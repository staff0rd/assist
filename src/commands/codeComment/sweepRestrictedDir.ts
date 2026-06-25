import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { getRestrictedDir } from "./getRestrictedDir";

const STALE_AFTER_MS = 30 * 60 * 1000;

export function sweepRestrictedDir(dir = getRestrictedDir()): void {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}

	const cutoff = Date.now() - STALE_AFTER_MS;
	for (const entry of entries) {
		const path = join(dir, entry);
		try {
			if (statSync(path).mtimeMs < cutoff) unlinkSync(path);
		} catch {
			continue;
		}
	}
}
