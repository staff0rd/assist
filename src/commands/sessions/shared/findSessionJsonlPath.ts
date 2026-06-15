import * as path from "node:path";
import { discoverSessionJsonlPaths } from "./discoverSessions";
import { parseSessionFile } from "./parseSessionFile";

/**
 * Locate the JSONL file backing a session. Files are named <sessionId>.jsonl,
 * but resumed sessions can carry an inner sessionId that differs from the
 * filename, so fall back to matching the parsed metadata.
 */
export async function findSessionJsonlPath(
	sessionId: string,
): Promise<string | null> {
	const paths = await discoverSessionJsonlPaths();
	const direct = paths.find(
		(p) => path.basename(p.path, ".jsonl") === sessionId,
	);
	if (direct) return direct.path;
	for (const p of paths) {
		const meta = await parseSessionFile(p.path, p.origin);
		if (meta?.sessionId === sessionId) return p.path;
	}
	return null;
}
