import { execFileSync } from "node:child_process";
import { parseGitHubUrl } from "./parseGitHubUrl";

const PULL_REF = /^refs\/pull\/(\d+)\/head$/;
const HEAD_REF = /^refs\/heads\/(.+)$/;

type Git = (args: string[]) => string | null;

function gitIn(cwd: string | undefined): Git {
	return (args) => {
		try {
			return (
				execFileSync("git", args, {
					encoding: "utf8",
					stdio: ["pipe", "pipe", "pipe"],
					windowsHide: true,
					cwd,
				}).trim() || null
			);
		} catch {
			return null;
		}
	};
}

function remoteOwner(remote: string, git: Git): string | null {
	const url = parseGitHubUrl(remote)
		? remote
		: git(["remote", "get-url", remote]);
	return url ? (parseGitHubUrl(url)?.org ?? null) : null;
}

// A fork PR's head branch lives in the fork, so a bare branch name doesn't
// match it in the base repo; gh needs the PR number or `owner:branch`.
export function currentPrSelector(
	branch: string,
	baseOrg: string,
	cwd?: string,
): string {
	const git = gitIn(cwd);
	const branchConfig = (key: string) =>
		git(["config", "--get", `branch.${branch}.${key}`]);
	const merge = branchConfig("merge");
	const pull = merge?.match(PULL_REF);
	if (pull) return pull[1];
	const remote = branchConfig("remote");
	const owner = remote ? remoteOwner(remote, git) : null;
	if (owner && owner.toLowerCase() !== baseOrg.toLowerCase())
		return `${owner}:${merge?.match(HEAD_REF)?.[1] ?? branch}`;
	return branch;
}
