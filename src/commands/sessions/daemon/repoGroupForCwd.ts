import type { RepoGroup } from "../shared/RepoGroup";
import { shouldProxyToWindows } from "./isWindowsCwd";
import { originResolutionForCwd } from "./originForCwd";
import { repoDirExists } from "./repoDirExists";
import { mainWorktree } from "./worktree/listWorktreePaths";
import { worktreeAttributionIncludingReaped } from "./worktree/readWorktreeRegistry";

type Resolution = { group: RepoGroup | undefined; stable: boolean };

const cache = new Map<string, RepoGroup | undefined>();

export function repoGroupForCwd(
	cwd: string | undefined,
): RepoGroup | undefined {
	if (!cwd) return undefined;
	if (cache.has(cwd)) return cache.get(cwd);
	const { group, stable } = resolveRepoGroup(cwd);
	// why: a worktree is spawned while its tree is still seeding, so a git call can fail transiently — caching that answer would strand the session outside its clone's group until the daemon restarts
	if (stable) cache.set(cwd, group);
	return group;
}

function resolveRepoGroup(cwd: string): Resolution {
	const clone = mainWorktree(cwd);
	const origin = clone ? originResolutionForCwd(clone) : undefined;
	if (clone && origin)
		return {
			group: hostedGroup(cwd, origin.origin, clone),
			stable: origin.stable,
		};
	const reaped = worktreeAttributionIncludingReaped(cwd);
	if (!reaped) return { group: undefined, stable: repoDirExists(cwd) };
	const current = currentOriginOfClone(reaped.clone);
	return {
		group: hostedGroup(cwd, current?.origin ?? reaped.origin, reaped.clone),
		stable: current?.stable === true,
	};
}

/**
 * The registry stamps an origin at creation time and never refreshes it, so a
 * clone that gained a remote afterwards leaves its reaped worktrees stranded on
 * the old key. Prefer what the clone reports now, and fall back to the recorded
 * origin only when the clone itself is no longer readable.
 */
function currentOriginOfClone(clone: string) {
	const main = mainWorktree(clone);
	return main ? originResolutionForCwd(main) : undefined;
}

function hostedGroup(cwd: string, origin: string, clone: string): RepoGroup {
	return {
		origin: shouldProxyToWindows(cwd) ? `windows:${origin}` : origin,
		clone,
	};
}
