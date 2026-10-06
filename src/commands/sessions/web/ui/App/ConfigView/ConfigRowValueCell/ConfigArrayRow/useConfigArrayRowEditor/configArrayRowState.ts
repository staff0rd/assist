import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import type { ConfigArrayItem } from "./configArrayItems";
import { configArrayLayerItems } from "./configArrayLayerItems";
import { configArrayRowIndexer } from "./configArrayRowState/configArrayRowIndexer";
import { defaultConfigScope } from "../../defaultConfigScope";
import type { ConfigScope } from "../../saveConfigValue";
import type { ConfigArrayDraft } from "./useConfigArrayDraft";

export function configArrayRowState(
	entry: ConfigEntry,
	items: ConfigArrayItem[],
	draft: ConfigArrayDraft | undefined,
) {
	const { draftRow, itemIndexOf } = configArrayRowIndexer(items, draft);
	const itemAt = (row: number) => {
		const index = itemIndexOf(row);
		return index === undefined ? undefined : items[index];
	};
	const ownerOf = (row: number) => itemAt(row)?.owner;
	const layerOf = (scope: ConfigScope) => configArrayLayerItems(entry, scope);
	const scopeToWrite = (row: number) =>
		ownerOf(row)?.scope ?? defaultConfigScope(entry);

	return {
		itemIndexOf,
		itemAt,
		ownerOf,
		layerOf,
		scopeToWrite,
		rowCount: items.length + (draftRow === undefined ? 0 : 1),
		isOpen: (row: number) => draft?.index === row,
		valueOf: (row: number) =>
			draft?.index === row ? draft.value : itemAt(row)?.value,
		scopeOf: (row: number) =>
			draft?.index === row ? draft.scope : scopeToWrite(row),
		canMove: (row: number, delta: number) => {
			const owner = ownerOf(row);
			if (!owner) return false;
			const to = owner.indexInScope + delta;
			return to >= 0 && to < layerOf(owner.scope).length;
		},
	};
}
