import { getPreferredRemoteRepo } from "../commands/prs/getPreferredRemoteRepo";

export function gitRefUrl(
	kind: "branch" | "commit",
	ref: string,
	cwd?: string,
): string | undefined {
	const repo = getPreferredRemoteRepo(cwd);
	if (!repo) return undefined;
	const path = kind === "branch" ? "tree" : "commit";
	return `https://github.com/${repo.org}/${repo.repo}/${path}/${ref}`;
}
