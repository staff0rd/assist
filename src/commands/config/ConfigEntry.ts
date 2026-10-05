import type { ConfigNode } from "../../shared/ConfigNode";
import type { ConfigLeaf } from "../../shared/describeConfigLeaves";
import type { ConfigEntryLayers } from "./configEntryLayers";
import type { ConfigSource } from "./resolveConfigSources";

export type ConfigEntry = ConfigLeaf & {
	value: unknown;
	source: ConfigSource;
	sources?: ConfigSource[];
	layers?: ConfigEntryLayers;
	repoKey?: string;
	repoSource?: "db" | "yml";
	globalConfigFile?: string;
	globalOnly?: boolean;
	node?: ConfigNode;
	note?: string;
	setter?: string;
};
