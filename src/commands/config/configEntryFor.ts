import type { ConfigLeaf } from "../../shared/describeConfigLeaves";
import { redactConfigSecrets } from "../../shared/redactConfigSecrets";
import type { ConfigEntry } from "./ConfigEntry";
import type { ConfigEntryContext } from "./configEntryContext";
import { configEntryLayers } from "./configEntryLayers";
import { configEntryNode } from "./configEntryNode";
import { configHelpForKey } from "./configHelpForKey";
import { getNestedValue } from "./getNestedValue";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { resolveConfigSources } from "./resolveConfigSources";

export function configEntryFor(
	leaf: ConfigLeaf,
	{ config, layers, globalConfigFile, schema }: ConfigEntryContext,
): ConfigEntry {
	const sources = resolveConfigSources(leaf.key, layers);
	const node = configEntryNode(schema, leaf.key);
	const help = configHelpForKey(leaf.key);
	return {
		...leaf,
		...(help ? { note: help.note, setter: help.setter } : {}),
		...(leaf.defaultValue === undefined
			? {}
			: { defaultValue: redactConfigSecrets(leaf.defaultValue, node) }),
		value: redactConfigSecrets(getNestedValue(config, leaf.key), node),
		source: sources[0] ?? "default",
		sources,
		layers: configEntryLayers(leaf.key, layers, node),
		...(layers.repoKey ? { repoKey: layers.repoKey } : {}),
		...(layers.repoSource ? { repoSource: layers.repoSource } : {}),
		globalConfigFile,
		globalOnly: isGlobalOnlyConfigKey(leaf.key),
		node,
	};
}
