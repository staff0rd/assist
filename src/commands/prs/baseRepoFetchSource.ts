import { findRepoRemotes } from "./findRepoRemotes";
import { resolveBaseRepo } from "./resolveBaseRepo";

export function baseRepoFetchSource(cwd: string = process.cwd()): string {
	const base = resolveBaseRepo(undefined, cwd)?.base;
	if (!base) return "origin";
	const { matching, url } = findRepoRemotes(cwd, base);
	return matching ?? url;
}
