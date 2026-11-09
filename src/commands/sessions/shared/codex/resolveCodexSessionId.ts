import * as fs from "node:fs";
import type { ConversationLaunch } from "../../../../shared/harnessAdapters/types";
import { codexRolloutMeta } from "./codexRolloutMeta";
import { discoverCodexRolloutPaths } from "./discoverCodexRolloutPaths";
import { readCodexHeadLines } from "./readCodexHeadLines";

const META_LINES = 5;

export async function resolveCodexSessionId({
	cwd,
	launchedAt,
	sinceMs,
	claimed,
}: ConversationLaunch): Promise<string | null> {
	if (!cwd) return null;
	const paths = await discoverCodexRolloutPaths();
	const touched = await Promise.all(
		paths.map((file) => touchedSince(file, sinceMs)),
	);
	const candidates = await Promise.all(
		paths
			.filter((_, index) => touched[index])
			.map((file) => startedIn(file, cwd, sinceMs)),
	);
	return firstUnclaimedRolloutAfterLaunch(
		candidates.filter(
			(candidate): candidate is Rollout =>
				!!candidate && !claimed.has(candidate.sessionId),
		),
		launchedAt,
	);
}

type Rollout = { sessionId: string; startedAt: number };

function firstUnclaimedRolloutAfterLaunch(
	rollouts: Rollout[],
	launchedAt: number,
): string | null {
	const byStart = [...rollouts].sort((a, b) => a.startedAt - b.startedAt);
	const afterLaunch = byStart.find((r) => r.startedAt >= launchedAt);
	return (afterLaunch ?? byStart.at(-1))?.sessionId ?? null;
}

async function startedIn(
	file: string,
	cwd: string,
	sinceMs: number,
): Promise<Rollout | null> {
	const meta = codexRolloutMeta(await readCodexHeadLines(file, META_LINES));
	if (!meta.sessionId || meta.cwd !== cwd) return null;
	const startedAt = Date.parse(meta.timestamp);
	if (!Number.isFinite(startedAt) || startedAt < sinceMs) return null;
	return { sessionId: meta.sessionId, startedAt };
}

async function touchedSince(file: string, sinceMs: number): Promise<boolean> {
	try {
		return (await fs.promises.stat(file)).mtimeMs >= sinceMs;
	} catch {
		return false;
	}
}
