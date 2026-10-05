import {
	getGlobalConfigPath,
	projectConfigPathFrom,
} from "../../shared/loadConfigFrom";
import { loadRawYaml } from "../../shared/loadRawYaml";
import { resolveRepoLayer } from "../../shared/resolveRepoLayer";

export type RawConfigLayers = {
	project: Record<string, unknown>;
	global: Record<string, unknown>;
	repoOverride: Record<string, unknown>;
	repoKey?: string;
	repoSource?: "db" | "yml";
};

export function readRawConfigLayers(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): RawConfigLayers {
	const global = loadRawYaml(globalConfigPath);
	const repo = resolveRepoLayer(global, cwd);
	return {
		project: loadRawYaml(projectConfigPathFrom(cwd)),
		global,
		repoOverride: repo.override,
		...(repo.key === undefined ? {} : { repoKey: repo.key }),
		...(repo.source === undefined ? {} : { repoSource: repo.source }),
	};
}
