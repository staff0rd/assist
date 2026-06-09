import * as fs from "node:fs";
import * as path from "node:path";
import { discoverSessionJsonlPaths } from "../shared/discoverSessions";
import { parseSessionFile } from "../shared/parseSessionFile";

const POLL_MS = 3_000;

type WatchOptions = {
	cwd: string;
	sinceMs: number;
	isClaimed: (sessionId: string) => boolean;
	isActive: () => boolean;
	onSessionId: (sessionId: string) => void;
	pollMs?: number;
};

/**
 * Poll ~/.claude/projects for session JSONL files created after `sinceMs`
 * whose cwd matches, reporting the matching sessionId via onSessionId. Keeps
 * watching while the session is active: when a card's work moves to a newer
 * Claude session (e.g. a backlog item advancing phase->phase) the newest
 * matching transcript is adopted, rather than pinning to the first discovered.
 */
export async function watchClaudeSessionId(
	options: WatchOptions,
): Promise<void> {
	let adoptedMs = 0;
	while (options.isActive()) {
		const latest = await findLatestSessionId(options);
		if (latest && latest.createdMs > adoptedMs) {
			adoptedMs = latest.createdMs;
			options.onSessionId(latest.sessionId);
		}
		await sleep(options.pollMs ?? POLL_MS);
	}
}

async function findLatestSessionId(
	options: WatchOptions,
): Promise<{ sessionId: string; createdMs: number } | null> {
	const paths = await discoverSessionJsonlPaths();
	let latest: { sessionId: string; createdMs: number } | null = null;
	for (const filePath of paths) {
		const createdMs = await createdSince(filePath, options.sinceMs);
		if (createdMs === null) continue;
		const meta = await parseSessionFile(filePath);
		if (!meta?.cwd || options.isClaimed(meta.sessionId)) continue;
		if (path.resolve(meta.cwd) !== path.resolve(options.cwd)) continue;
		if (!latest || createdMs > latest.createdMs)
			latest = { sessionId: meta.sessionId, createdMs };
	}
	return latest;
}

async function createdSince(
	filePath: string,
	sinceMs: number,
): Promise<number | null> {
	try {
		const stat = await fs.promises.stat(filePath);
		const createdMs = stat.birthtimeMs || stat.mtimeMs;
		return createdMs >= sinceMs ? createdMs : null;
	} catch {
		return null;
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
