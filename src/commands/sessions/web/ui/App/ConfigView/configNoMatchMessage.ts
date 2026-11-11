import type { ConfigSource } from "../../../../../config/resolveConfigSources";
import { configSourceLabel, configSources } from "./configSourceLabel";

export function configNoMatchMessage(
	search: string,
	scopes: ReadonlySet<ConfigSource>,
): string {
	const term = search.trim();
	const labels = configSources
		.filter((source) => scopes.has(source))
		.map(configSourceLabel)
		.join(", ");
	if (!labels) return `No keys or descriptions match “${term}”.`;
	if (!term) return `No keys come from ${labels}.`;
	return `No keys or descriptions match “${term}” in ${labels}.`;
}
