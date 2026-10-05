import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getStoreDir } from "./loadJson";

export type RepoConfigOverrides = Record<string, Record<string, unknown>>;

export type RepoConfigCache = {
	refreshedAt: string;
	repos: RepoConfigOverrides;
};

export function repoConfigCachePath(): string {
	return join(getStoreDir(), "repo-config-cache.json");
}

export function readRepoConfigCache(): RepoConfigOverrides {
	const path = repoConfigCachePath();
	if (!existsSync(path)) return {};
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8")) as
			| Partial<RepoConfigCache>
			| undefined;
		return parsed?.repos ?? {};
	} catch {
		return {};
	}
}
