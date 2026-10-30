import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getStoreDir } from "./loadJson";

export type RepoConfigOverrides = Record<string, Record<string, unknown>>;

export type RepoConfigCache = {
	refreshedAt: string;
	repos: RepoConfigOverrides;
	user?: Record<string, unknown>;
};

export function repoConfigCachePath(): string {
	return join(getStoreDir(), "repo-config-cache.json");
}

export function readConfigCacheFile(): Partial<RepoConfigCache> {
	const path = repoConfigCachePath();
	if (!existsSync(path)) return {};
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8")) as
			| Partial<RepoConfigCache>
			| undefined;
		return parsed ?? {};
	} catch {
		return {};
	}
}

export function readRepoConfigCache(): RepoConfigOverrides {
	return readConfigCacheFile().repos ?? {};
}
