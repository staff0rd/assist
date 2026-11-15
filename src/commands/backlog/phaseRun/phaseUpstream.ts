import { phaseGit } from "./phaseGit";

type PhaseUpstream = { ref: string; remote: string; branch: string };

/** The remote branch a worktree's branch tracks (e.g. origin/main), if any. */
export function phaseUpstream(cwd?: string): PhaseUpstream | undefined {
	const ref = phaseGit(
		["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
		cwd,
	);
	if (!ref.ok || !ref.out) return undefined;
	const slash = ref.out.indexOf("/");
	if (slash === -1) return undefined;
	return {
		ref: ref.out,
		remote: ref.out.slice(0, slash),
		branch: ref.out.slice(slash + 1),
	};
}
