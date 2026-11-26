import { loadConfig } from "../../shared/loadConfig";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { findForkParent } from "./findForkParent";
import { getPreferredRemoteRepo } from "./getPreferredRemoteRepo";

type Repo = { org: string; repo: string };

export type BaseRepoMode = "auto" | "origin" | "parent";

type ResolvedBaseRepo = {
	base: Repo;
	origin: Repo;
	mode: BaseRepoMode;
};

export function resolveBaseRepo(
	override?: BaseRepoMode,
	cwd?: string,
): ResolvedBaseRepo | null {
	const origin = getPreferredRemoteRepo(cwd);
	if (!origin) return null;
	const config = cwd ? loadConfigFrom(cwd) : loadConfig();
	const mode = override ?? config.prs?.baseRepo ?? "auto";
	if (mode === "origin") return { base: origin, origin, mode };

	const parent = findForkParent(origin, cwd);
	if (typeof parent === "object") return { base: parent, origin, mode };
	if (mode === "parent") {
		const slug = `${origin.org}/${origin.repo}`;
		throw new Error(
			parent === "not-a-fork"
				? `${slug} is not a fork, so it has no parent repo to target.`
				: `Could not look up the parent repo of ${slug} with gh.`,
		);
	}
	return { base: origin, origin, mode };
}
