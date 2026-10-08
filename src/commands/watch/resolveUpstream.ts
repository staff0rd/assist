import { execFileSync } from "node:child_process";

type UpstreamTarget = { branch: string; upstream: string };

export function runGit(args: string[], cwd?: string): string {
	return execFileSync("git", args, {
		encoding: "utf8",
		stdio: ["pipe", "pipe", "pipe"],
		cwd,
		windowsHide: true,
	}).trim();
}

export function resolveUpstream(cwd?: string): UpstreamTarget {
	try {
		runGit(["rev-parse", "--is-inside-work-tree"], cwd);
	} catch {
		throw new Error(
			"not a git repository — run assist watch wait from inside a repo",
		);
	}

	let branch: string;
	try {
		branch = runGit(["symbolic-ref", "--quiet", "--short", "HEAD"], cwd);
	} catch {
		throw new Error(
			"HEAD is detached — check out a branch before waiting on its upstream",
		);
	}

	try {
		return {
			branch,
			upstream: runGit(
				["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
				cwd,
			),
		};
	} catch {
		throw new Error(
			`branch "${branch}" has no upstream — set one with: git push -u origin ${branch}`,
		);
	}
}
