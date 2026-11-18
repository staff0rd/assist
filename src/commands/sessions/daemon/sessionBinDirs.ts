import { harnessBinDir } from "../../../shared/nodeRuntime/harnessBinDir";
import { repoNode } from "../../../shared/nodeRuntime/repoNode";
import { daemonLog } from "./daemonLog";

/* why: the repo's pinned node goes first so the session's `node` matches what
 * `cd`-ing into the repo gives; the harness bin follows so its CLIs still
 * resolve when the pinned node has none installed. */
export function sessionBinDirs(
	cwd: string | undefined,
	sessionId?: string,
	deps: { repo: typeof repoNode; harness: typeof harnessBinDir } = {
		repo: repoNode,
		harness: harnessBinDir,
	},
): string[] {
	const harness = deps.harness();
	const repo = cwd ? deps.repo(cwd) : undefined;
	if (repo && !repo.ok)
		daemonLog(
			`${sessionId ? `session ${sessionId}` : "spawn"} in ${cwd}: ${repo.pin.file} wants node "${repo.pin.spec}" but ${repo.error}; starting on the daemon's node ${process.version}`,
		);
	const dirs = [repo?.ok ? repo.node.binDir : undefined, harness];
	return [...new Set(dirs.filter((dir): dir is string => !!dir))];
}
