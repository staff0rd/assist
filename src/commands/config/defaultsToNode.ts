import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import type { ScopeOptions } from "./scopeOptionsError";

export function defaultsToNode(key: string, options: ScopeOptions): boolean {
	if (options.node) return true;
	return (
		isGlobalOnlyConfigKey(key) && options.repo === undefined && !options.user
	);
}
