import type { ConfigSource } from "../../../../../config/resolveConfigSources";
import { configSources } from "./configSourceLabel";

export function parseScopeParam(param: string | null): Set<ConfigSource> {
	const names = (param ?? "").split(",").map((name) => name.trim());
	return new Set(configSources.filter((source) => names.includes(source)));
}
