import { isAncestor, phaseGit } from "./phaseGit";
import { phaseUpstream } from "./phaseUpstream";

type LandingTarget = {
	/** Where the work lands, for messages. */
	label: string;
	/** Refresh and return the tip the phase must build on. */
	tip: () => string;
	/** Publish `head` there; false when the tip moved meanwhile. */
	publish: (head: string) => boolean;
};

function fastForwardItemTree(itemTree: string, head: string): boolean {
	return phaseGit(["merge", "--ff-only", head], itemTree).ok;
}

/**
 * The branch a parallel phase lands on: the remote branch this worktree
 * tracks (pushed to, then pulled into the run's item tree), or, with no
 * upstream, the run's item tree itself.
 */
export function landingTarget(itemTree: string): LandingTarget {
	const upstream = phaseUpstream();
	if (!upstream)
		return {
			label: `the item tree ${itemTree}`,
			tip: () => phaseGit(["rev-parse", "HEAD"], itemTree).out,
			publish: (head) => fastForwardItemTree(itemTree, head),
		};
	return {
		label: upstream.ref,
		tip: () => {
			phaseGit(["fetch", "--quiet", upstream.remote, upstream.branch]);
			return phaseGit(["rev-parse", upstream.ref]).out;
		},
		publish: (head) => {
			const pushed = phaseGit([
				"push",
				upstream.remote,
				`${head}:refs/heads/${upstream.branch}`,
			]).ok;
			if (
				pushed &&
				isAncestor(phaseGit(["rev-parse", "HEAD"], itemTree).out, head)
			)
				fastForwardItemTree(itemTree, head);
			return pushed;
		},
	};
}
