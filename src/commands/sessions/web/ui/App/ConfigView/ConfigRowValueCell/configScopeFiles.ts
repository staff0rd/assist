import type { ConfigScope } from "./saveConfigValue";

const DEFAULT_GLOBAL_CONFIG_FILE = "~/.assist.yml";

export function configScopeFiles(
	repoKey: string | undefined,
	globalConfigFile: string = DEFAULT_GLOBAL_CONFIG_FILE,
): Record<ConfigScope, string> {
	return {
		project: "this repo's assist.yml",
		repo: repoKey
			? `repos.${repoKey} in the shared db (all nodes)`
			: "this repo's override in the shared db (all nodes)",
		global: globalConfigFile,
	};
}
