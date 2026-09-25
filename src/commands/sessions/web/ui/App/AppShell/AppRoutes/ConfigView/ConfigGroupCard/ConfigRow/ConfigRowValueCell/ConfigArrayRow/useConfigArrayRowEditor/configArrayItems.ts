import {
	type ConfigArrayItemOwner,
	configArrayItemOwners,
} from "../../../../../../../../../../../../config/configArrayItemOwners";
import type { ConfigEntry } from "../../../../../../../../../../../../config/readConfigEntries";
import { configArrayLayerItems } from "./configArrayLayerItems";
import { effectiveConfigValue } from "../../effectiveConfigValue";

export type ConfigArrayItem = {
	value: unknown;
	owner?: ConfigArrayItemOwner;
};

export function configArrayItems(entry: ConfigEntry): ConfigArrayItem[] {
	const owners = configArrayItemOwners(entry.key, entry.layers ?? {});
	if (owners.length > 0)
		return owners.map((owner) => ({
			value: configArrayLayerItems(entry, owner.scope)[owner.indexInScope],
			owner,
		}));

	const effective = effectiveConfigValue(entry);
	return Array.isArray(effective) ? effective.map((value) => ({ value })) : [];
}
