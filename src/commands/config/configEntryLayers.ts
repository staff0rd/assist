import type { ConfigNode } from "../../shared/ConfigNode";
import { redactConfigSecrets } from "../../shared/redactConfigSecrets";
import type { ConfigWriteScope } from "./ConfigWriteScope";
import { getNestedValue } from "./getNestedValue";
import type { RawConfigLayers } from "./readRawConfigLayers";

export type ConfigEntryLayers = Partial<Record<ConfigWriteScope, unknown>>;

type RawLayerName = "project" | "repoOverride" | "global" | "user";

const LAYERS: [ConfigWriteScope, RawLayerName][] = [
	["project", "project"],
	["repo", "repoOverride"],
	["global", "global"],
	["user", "user"],
];

export function configEntryLayers(
	key: string,
	layers: RawConfigLayers,
	node: ConfigNode | undefined,
): ConfigEntryLayers {
	const entryLayers: ConfigEntryLayers = {};
	for (const [scope, layer] of LAYERS) {
		const raw = getNestedValue(layers[layer], key);
		if (raw !== undefined) entryLayers[scope] = redactConfigSecrets(raw, node);
	}
	return entryLayers;
}
