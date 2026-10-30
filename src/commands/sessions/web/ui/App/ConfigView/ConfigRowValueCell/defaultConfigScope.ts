import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { configScopesWithValue } from "./configScopesWithValue";
import type { ConfigScope } from "./saveConfigValue";

export function defaultConfigScope(entry: ConfigEntry): ConfigScope {
	const writable = entry.writableScopes;
	const set = configScopesWithValue(entry).filter(
		(scope) => !writable || writable.includes(scope),
	);
	return set[0] ?? writable?.[0] ?? "project";
}
