import * as path from "node:path";
import { discoverCodexRolloutPaths } from "./codex/discoverCodexRolloutPaths";
import { parseCodexSessionFile } from "./codex/parseCodexSessionFile";
import { discoverSessionJsonlPaths } from "./discoverSessions";
import { type HistoricalSession, parseSessionFile } from "./parseSessionFile";

const CODEX_ROLLOUT_ID_LENGTH = 36;

export async function lookupSessionsById(
	ids: string[],
): Promise<Map<string, HistoricalSession>> {
	const wanted = new Set(ids);
	if (wanted.size === 0) return new Map();

	const found = new Map<string, HistoricalSession>();
	const [claudePaths, codexPaths] = await Promise.all([
		discoverSessionJsonlPaths(),
		discoverCodexRolloutPaths(),
	]);

	await Promise.all([
		...claudePaths.map(async ({ path: filePath, origin }) => {
			const id = path.basename(filePath, ".jsonl");
			if (!wanted.has(id)) return;
			const session = await parseSessionFile(filePath, origin);
			if (session) found.set(id, session);
		}),
		...codexPaths.map(async (filePath) => {
			const id = codexRolloutIdFromFilename(filePath);
			if (!id || !wanted.has(id)) return;
			const session = await parseCodexSessionFile(filePath);
			if (session) found.set(id, session);
		}),
	]);

	return found;
}

function codexRolloutIdFromFilename(filePath: string): string | undefined {
	const name = path.basename(filePath, ".jsonl");
	return name.length > CODEX_ROLLOUT_ID_LENGTH
		? name.slice(-CODEX_ROLLOUT_ID_LENGTH)
		: undefined;
}
