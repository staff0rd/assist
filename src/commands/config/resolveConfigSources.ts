import { getNestedValue } from "./getNestedValue";
import type { RawConfigLayers } from "./readRawConfigLayers";

export type ConfigSource = "project" | "repo" | "global" | "user" | "default";

export function resolveConfigSources(
	key: string,
	layers: RawConfigLayers,
): ConfigSource[] {
	const sources: ConfigSource[] = [];
	if (getNestedValue(layers.project, key) !== undefined)
		sources.push("project");
	if (getNestedValue(layers.repoOverride, key) !== undefined)
		sources.push("repo");
	if (getNestedValue(layers.global, key) !== undefined) sources.push("global");
	if (getNestedValue(layers.user, key) !== undefined) sources.push("user");
	return sources;
}
