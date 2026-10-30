import type { ConfigWriteScope } from "./ConfigWriteScope";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { isNodeOnlyConfigKey } from "./isNodeOnlyConfigKey";

export function configWritableScopes(
	key: string,
): ConfigWriteScope[] | undefined {
	if (isGlobalOnlyConfigKey(key)) return ["global"];
	if (isNodeOnlyConfigKey(key)) return ["project", "repo", "global"];
	return undefined;
}
