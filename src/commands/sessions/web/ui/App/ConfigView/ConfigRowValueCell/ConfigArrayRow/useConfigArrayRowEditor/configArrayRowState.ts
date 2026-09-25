import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import type { ConfigArrayItem } from "./configArrayItems";
import { configArrayLayerItems } from "./configArrayLayerItems";
import { defaultConfigScope } from "../../defaultConfigScope";
import type { ConfigScope } from "../../saveConfigValue";
import type { ConfigArrayDraft } from "./useConfigArrayDraft";

export function configArrayRowState(
	entry: ConfigEntry,
	items: ConfigArrayItem[],
	draft: ConfigArrayDraft | undefined,
) {
	const ownerOf = (index: number) => items[index]?.owner;
	const layerOf = (scope: ConfigScope) => configArrayLayerItems(entry, scope);
	const scopeToWrite = (index: number) =>
		ownerOf(index)?.scope ?? defaultConfigScope(entry);

	return {
		ownerOf,
		layerOf,
		scopeToWrite,
		rowCount: items.length + (draft && draft.index >= items.length ? 1 : 0),
		isOpen: (index: number) => draft?.index === index,
		valueOf: (index: number) =>
			draft?.index === index ? draft.value : items[index]?.value,
		scopeOf: (index: number) =>
			draft?.index === index ? draft.scope : scopeToWrite(index),
		canMove: (index: number, delta: number) => {
			const owner = ownerOf(index);
			if (!owner) return false;
			const to = owner.indexInScope + delta;
			return to >= 0 && to < layerOf(owner.scope).length;
		},
	};
}
