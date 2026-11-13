import { execFileSync } from "node:child_process";
import { parseGitHubUrl } from "./parseGitHubUrl";

const PULL_REF = /^refs\/pull\/(\d+)\/head$/;

function gitOrNull(args: string[]): string | null {
	try {
		return (
			execFileSync("git", args, {
				encoding: "utf8",
				stdio: ["pipe", "pipe", "pipe"],
				windowsHide: true,
			}).trim() || null
		);
	} catch {
		return null;
	}
}

function branchConfig(branch: string, key: string): string | null {
	return gitOrNull(["config", "--get", `branch.${branch}.${key}`]);
}

function remoteOwner(remote: string): string | null {
	const url = parseGitHubUrl(remote)
		? remote
		: gitOrNull(["remote", "get-url", remote]);
	return url ? (parseGitHubUrl(url)?.org ?? null) : null;
}

// A fork PR's head branch lives in the fork, so a bare branch name doesn't
// match it in the base repo; gh needs the PR number or `owner:branch`.
export function currentPrSelector(branch: string, baseOrg: string): string {
	const pull = branchConfig(branch, "merge")?.match(PULL_REF);
	if (pull) return pull[1];
	const remote = branchConfig(branch, "remote");
	const owner = remote ? remoteOwner(remote) : null;
	if (owner && owner.toLowerCase() !== baseOrg.toLowerCase())
		return `${owner}:${branch}`;
	return branch;
}
