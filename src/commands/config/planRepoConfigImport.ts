import type { RepoConfigOverrides } from "../../shared/readRepoConfigCache";
import { SHARED_REPO_CONFIG_SOURCE } from "../../shared/resolveRepoLayer";
import {
	AmbiguousRepoConfigError,
	originKeyCandidates,
} from "../../shared/resolveRepoOverride";
import { repoConfigSchema } from "../../shared/types";
import {
	diffRepoConfigLeaves,
	type RepoConfigLeafChange,
} from "./diffRepoConfigLeaves";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

export type RepoConfigImportPlan = {
	ymlKey: string;
	dbKey: string;
	changes: RepoConfigLeafChange[];
	merged: Record<string, unknown>;
	errors: string[];
};

export function planRepoConfigImport(
	ymlRepos: Record<string, unknown>,
	dbRepos: RepoConfigOverrides,
): RepoConfigImportPlan[] {
	return Object.entries(ymlRepos).map(([ymlKey, block]) => {
		const dbKey = matchDbKey(dbRepos, ymlKey) ?? ymlKey;
		const current = dbRepos[dbKey] ?? {};
		const incoming = isPlainObject(block) ? block : {};
		const changes = diffRepoConfigLeaves(current, incoming);
		const merged = changes.reduce(
			(acc, change) => setNestedValue(acc, change.key, change.to),
			current,
		);
		const validation = validateConfig(merged, ymlKey, repoConfigSchema);
		const errors = validation.ok
			? []
			: validation.errors.map((error) => `repos.${ymlKey}.${error}`);
		return { ymlKey, dbKey, changes, merged, errors };
	});
}

function matchDbKey(
	dbRepos: RepoConfigOverrides,
	ymlKey: string,
): string | undefined {
	const ymlCandidates = originKeyCandidates(ymlKey);
	const matches = Object.keys(dbRepos).filter(
		(key) => ymlCandidates.has(key) || originKeyCandidates(key).has(ymlKey),
	);
	if (matches.length > 1)
		throw new AmbiguousRepoConfigError(
			`Ambiguous repos config in ${SHARED_REPO_CONFIG_SOURCE}: keys ${matches
				.map((m) => `"${m}"`)
				.join(", ")} all match "${ymlKey}". Keep a single key per repository.`,
		);
	return matches[0];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
