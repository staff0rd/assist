import { type BaseRepoMode, resolveBaseRepo } from "./resolveBaseRepo";
import { getRepoInfo } from "./shared";

export function getBaseRepoInfo(baseRepo?: BaseRepoMode): {
	org: string;
	repo: string;
} {
	return resolveBaseRepo(baseRepo)?.base ?? getRepoInfo();
}
