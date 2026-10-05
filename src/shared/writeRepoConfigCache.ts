import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
	type RepoConfigCache,
	type RepoConfigOverrides,
	repoConfigCachePath,
} from "./readRepoConfigCache";

export function writeRepoConfigCache(repos: RepoConfigOverrides): void {
	const path = repoConfigCachePath();
	mkdirSync(dirname(path), { recursive: true });
	const cache: RepoConfigCache = {
		refreshedAt: new Date().toISOString(),
		repos,
	};
	// why: write-then-rename so a concurrent synchronous loadConfigFrom never reads a half-written snapshot.
	const tmp = `${path}.${process.pid}.tmp`;
	writeFileSync(tmp, JSON.stringify(cache, null, 2));
	renameSync(tmp, path);
}
