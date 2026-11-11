import type { ConfigWriteScope } from "./ConfigWriteScope";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { isNodeOnlyConfigKey } from "./isNodeOnlyConfigKey";

export function configWritableScopes(
	key: string,
): ConfigWriteScope[] | undefined {
	const nodeOnly = isNodeOnlyConfigKey(key);
	if (isGlobalOnlyConfigKey(key))
		return nodeOnly ? ["global"] : ["global", "user"];
	if (nodeOnly) return ["project", "repo", "global"];
	return undefined;
}
