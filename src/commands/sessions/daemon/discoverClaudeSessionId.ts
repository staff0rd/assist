import * as fs from "node:fs";
import * as path from "node:path";
import { discoverSessionJsonlPaths } from "../shared/discoverSessions";
import { parseSessionFile } from "../shared/parseSessionFile";

const POLL_MS = 3_000;

type DiscoverOptions = {
	cwd: string;
	sinceMs: number;
	isClaimed: (sessionId: string) => boolean;
	isActive: () => boolean;
	pollMs?: number;
};

/**
 * Poll ~/.claude/projects for a session JSONL file created after `sinceMs`
 * whose cwd matches, returning its claude sessionId. Resolves null once the
 * session is no longer active.
 */
export async function discoverClaudeSessionId(
	options: DiscoverOptions,
): Promise<string | null> {
	while (options.isActive()) {
		const sessionId = await findNewSessionId(options);
		if (sessionId) return sessionId;
		await sleep(options.pollMs ?? POLL_MS);
	}
	return null;
}

async function findNewSessionId(
	options: DiscoverOptions,
): Promise<string | null> {
	const paths = await discoverSessionJsonlPaths();
	for (const filePath of paths) {
		if (!(await isCreatedSince(filePath, options.sinceMs))) continue;
		const meta = await parseSessionFile(filePath);
		if (!meta?.cwd || options.isClaimed(meta.sessionId)) continue;
		if (path.resolve(meta.cwd) === path.resolve(options.cwd))
			return meta.sessionId;
	}
	return null;
}

async function isCreatedSince(
	filePath: string,
	sinceMs: number,
): Promise<boolean> {
	try {
		const stat = await fs.promises.stat(filePath);
		return (stat.birthtimeMs || stat.mtimeMs) >= sinceMs;
	} catch {
		return false;
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
