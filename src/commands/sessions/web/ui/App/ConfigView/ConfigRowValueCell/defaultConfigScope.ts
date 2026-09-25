import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { configScopesWithValue } from "./configScopesWithValue";
import type { ConfigScope } from "./saveConfigValue";

export function defaultConfigScope(entry: ConfigEntry): ConfigScope {
	if (entry.globalOnly === true) return "global";
	return configScopesWithValue(entry)[0] ?? "project";
}
