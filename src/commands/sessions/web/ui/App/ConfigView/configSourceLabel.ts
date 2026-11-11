import { configScopeNames } from "../../../../../config/configScopeNames";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";

export const configSources: ConfigSource[] = [
	"project",
	"repo",
	"global",
	"user",
	"default",
];

export function configSourceLabel(source: ConfigSource): string {
	return source === "default" ? "default" : configScopeNames[source];
}
