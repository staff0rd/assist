import type { ConfigKeyScope } from "./writeConfigKeys";

const REPO_SCOPE_FLAGS: Record<string, ConfigKeyScope> = {
	git: "project",
	db: "repo",
};

export function parseRepoScopeFlag(
	value: string | undefined,
): ConfigKeyScope | undefined {
	return value === undefined ? undefined : REPO_SCOPE_FLAGS[value];
}
