import chalk from "chalk";
import { getCurrentOrigin } from "../commands/backlog/getCurrentOrigin";
import { readRepoConfigCache } from "./readRepoConfigCache";
import { matchRepoConfigKey, resolveRepoOverride } from "./resolveRepoOverride";

export const SHARED_REPO_CONFIG_SOURCE = "the shared db";

type RepoLayer = {
	override: Record<string, unknown>;
	key?: string;
	source?: "db" | "yml";
};

const warnedYmlKeys = new Set<string>();

export function resolveRepoLayer(
	globalRaw: Record<string, unknown>,
	cwd: string,
): RepoLayer {
	const cached = { repos: readRepoConfigCache() };
	if (Object.keys(cached.repos).length === 0 && !globalRaw.repos)
		return { override: {} };

	const origin = getCurrentOrigin(cwd);
	const dbKey = matchRepoConfigKey(cached, origin, SHARED_REPO_CONFIG_SOURCE);
	if (dbKey !== undefined)
		return {
			override: resolveRepoOverride(cached, origin, SHARED_REPO_CONFIG_SOURCE),
			key: dbKey,
			source: "db",
		};

	const ymlKey = matchRepoConfigKey(globalRaw, origin);
	if (ymlKey === undefined) return { override: {} };
	warnYmlRepoOverride(ymlKey);
	return {
		override: resolveRepoOverride(globalRaw, origin),
		key: ymlKey,
		source: "yml",
	};
}

function warnYmlRepoOverride(key: string): void {
	if (warnedYmlKeys.has(key)) return;
	warnedYmlKeys.add(key);
	console.error(
		chalk.yellow(
			`repos.${key} in ~/.assist.yml is not in the shared db, so other nodes don't see it. Run 'assist config import-repos' to share it.`,
		),
	);
}
