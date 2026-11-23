import { gitSync } from "../sessions/daemon/worktree/git";
import { findRepoRemotes } from "./findRepoRemotes";
import { resolveBaseRepo } from "./resolveBaseRepo";

type Repo = { org: string; repo: string };

const NEW_REMOTE_NAMES = ["upstream", "parent"];

function slug({ org, repo }: Repo): string {
	return `${org}/${repo}`.toLowerCase();
}

export function ensureBaseRepoRemote(cwd: string = process.cwd()): string {
	const resolved = resolveBaseRepo(undefined, cwd);
	if (!resolved || slug(resolved.base) === slug(resolved.origin))
		return "origin";

	const { matching, names, url } = findRepoRemotes(cwd, resolved.base);
	if (matching) return matching;

	const name = NEW_REMOTE_NAMES.find((candidate) => !names.includes(candidate));
	if (!name) {
		throw new Error(
			`No git remote points at the parent repo ${url}, and the names ${NEW_REMOTE_NAMES.join(" and ")} are taken. Add one with: git remote add <name> ${url}`,
		);
	}
	gitSync(cwd, ["remote", "add", name, url]);
	console.log(`Added remote ${name} for the parent repo (${url})`);
	return name;
}
