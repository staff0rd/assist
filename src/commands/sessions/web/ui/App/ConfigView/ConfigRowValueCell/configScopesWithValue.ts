import { CONFIG_SCOPES_BY_PRECEDENCE } from "../../../../../../config/ConfigWriteScope";
import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { configEntrySources } from "./configScopesWithValue/configEntrySources";
import type { ConfigScope } from "./saveConfigValue";

export function configScopesWithValue(entry: ConfigEntry): ConfigScope[] {
	const sources = configEntrySources(entry);
	return CONFIG_SCOPES_BY_PRECEDENCE.filter((scope) => sources.includes(scope));
}
