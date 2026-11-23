import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { parseGitHubUrl } from "./parseGitHubUrl";
import { resolveBaseRepo } from "./resolveBaseRepo";

type Repo = { org: string; repo: string };
type Remote = { name: string; url: string };

const REMOTE_URL = /^remote\.(.+)\.url (.+)$/;

function listRemotes(cwd: string): Remote[] {
	const out = gitSyncOrNull(cwd, [
		"config",
		"--get-regexp",
		String.raw`^remote\..*\.url$`,
	]);
	return (out ?? "").split("\n").flatMap((line) => {
		const match = line.trim().match(REMOTE_URL);
		return match ? [{ name: match[1], url: match[2] }] : [];
	});
}

function pointsAt(remote: Remote, { org, repo }: Repo): boolean {
	const parsed = parseGitHubUrl(remote.url);
	return (
		parsed?.org.toLowerCase() === org.toLowerCase() &&
		parsed.repo.toLowerCase() === repo.toLowerCase()
	);
}

function urlLike(sibling: string | undefined, { org, repo }: Repo): string {
	return sibling?.startsWith("git@")
		? `git@github.com:${org}/${repo}.git`
		: `https://github.com/${org}/${repo}.git`;
}

export function baseRepoFetchSource(cwd: string = process.cwd()): string {
	const base = resolveBaseRepo(undefined, cwd)?.base;
	if (!base) return "origin";
	const remotes = listRemotes(cwd);
	const matching = remotes.filter((remote) => pointsAt(remote, base));
	if (matching.length === 0)
		return urlLike(remotes.find(({ name }) => name === "origin")?.url, base);
	return (matching.find(({ name }) => name === "origin") ?? matching[0]).name;
}
