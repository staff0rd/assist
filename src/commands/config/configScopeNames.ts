import type { ConfigWriteScope } from "./ConfigWriteScope";

export const configScopeNames: Record<ConfigWriteScope, string> = {
	project: "repo (git)",
	repo: "repo (db)",
	global: "user (node)",
	user: "user (db)",
};
