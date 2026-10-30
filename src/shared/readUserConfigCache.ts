import { readConfigCacheFile } from "./readRepoConfigCache";

export function readUserConfigCache(): Record<string, unknown> {
	return readConfigCacheFile().user ?? {};
}
