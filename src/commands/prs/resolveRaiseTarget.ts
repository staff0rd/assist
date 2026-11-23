import { type BaseRepoMode, resolveBaseRepo } from "./resolveBaseRepo";
import { getCurrentBranch } from "./shared";

type RaiseTarget = { repo?: string; forkHead?: string };

function resolveOrExit(override?: BaseRepoMode) {
	try {
		return resolveBaseRepo(override);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}

export function resolveRaiseTarget(override?: BaseRepoMode): RaiseTarget {
	const resolved = resolveOrExit(override);
	if (!resolved) return {};
	const { base, origin, mode } = resolved;
	const repo = `${base.org}/${base.repo}`;
	const crossRepo =
		repo.toLowerCase() !== `${origin.org}/${origin.repo}`.toLowerCase();
	if (crossRepo)
		return { repo, forkHead: `${origin.org}:${getCurrentBranch()}` };
	return mode === "origin" ? { repo } : {};
}
