import { dropUnknownConfigKeys } from "./dropUnknownConfigKeys";
import { loadRawYaml } from "./loadRawYaml";
import { readConfigCacheFile } from "./readRepoConfigCache";
import { resolveRepoLayer } from "./resolveRepoLayer";

type RawConfig = Record<string, unknown>;

export type RawConfigLayers = {
	user: RawConfig;
	global: RawConfig;
	globalPath: string;
	repo: RawConfig;
	repoSource?: "db" | "yml";
	project: RawConfig;
	projectPath: string;
	userDbRaw: RawConfig | undefined;
};

export function loadRawConfigLayers(
	cwd: string,
	globalConfigPath: string,
	projectPath: string,
): RawConfigLayers {
	const global = loadRawYaml(globalConfigPath);
	const userDbRaw = readConfigCacheFile().user;
	const repoLayer = resolveRepoLayer(global, cwd);
	return {
		user: userDbRaw ? dropUnknownConfigKeys(userDbRaw) : {},
		global,
		globalPath: globalConfigPath,
		repo: repoLayer.override,
		repoSource: repoLayer.source,
		project: loadRawYaml(projectPath),
		projectPath,
		userDbRaw,
	};
}
