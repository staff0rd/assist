import { execFileSync } from "node:child_process";
import { ensureBaseRepoRemote } from "../prs/ensureBaseRepoRemote";
import { resolveDefaultBranch } from "./resolveDefaultBranch";

export function resolveBranchBase(defaultBranch?: string): {
	baseRef: string;
	pushRef?: string;
} {
	const remote = ensureBaseRepoRemote();
	if (remote !== "origin") {
		execFileSync("git", ["fetch", remote], { stdio: "inherit" });
	}
	const branch = resolveDefaultBranch(defaultBranch, undefined, remote);
	return {
		baseRef: `${remote}/${branch}`,
		pushRef: remote === "origin" ? undefined : `origin/${branch}`,
	};
}
