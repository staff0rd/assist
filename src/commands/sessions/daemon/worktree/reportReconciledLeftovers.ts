import type { Session } from "../createSession";
import type { SpawnSession } from "../types";
import { accountedTrees } from "./accountedTrees";
import type { Leftover } from "./Leftover";
import { recheckReapedWorktrees } from "./recheckReapedWorktrees";
import { reportLeftovers } from "./reportLeftovers";
import { reportLeftoversEnabled } from "./reportLeftoversEnabled";

export async function reportReconciledLeftovers(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	orphanLeftovers: Leftover[],
	notify: () => void,
): Promise<void> {
	if (!reportLeftoversEnabled()) return;
	const reappeared = await recheckReapedWorktrees(accountedTrees(sessions));
	reportLeftovers(
		sessions,
		spawnWith,
		[...orphanLeftovers, ...reappeared],
		notify,
	);
}
