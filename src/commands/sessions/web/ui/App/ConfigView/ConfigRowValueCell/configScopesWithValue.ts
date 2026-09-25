import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { configEntrySources } from "./configScopesWithValue/configEntrySources";
import type { ConfigScope } from "./saveConfigValue";

const SCOPES: ConfigScope[] = ["project", "repo", "global"];

export function configScopesWithValue(entry: ConfigEntry): ConfigScope[] {
	const sources = configEntrySources(entry);
	return SCOPES.filter((scope) => sources.includes(scope));
}
