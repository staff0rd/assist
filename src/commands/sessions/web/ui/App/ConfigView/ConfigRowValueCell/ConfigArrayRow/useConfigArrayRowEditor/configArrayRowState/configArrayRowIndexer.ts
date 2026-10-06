import type { ConfigArrayItem } from "../configArrayItems";
import type { ConfigArrayDraft } from "../useConfigArrayDraft";

export function configArrayRowIndexer(
	items: ConfigArrayItem[],
	draft: ConfigArrayDraft | undefined,
) {
	const draftRow =
		draft && (draft.insertAfter !== undefined || draft.index >= items.length)
			? draft.index
			: undefined;

	return {
		draftRow,
		itemIndexOf: (row: number) => {
			if (draftRow === undefined || row < draftRow) return row;
			return row === draftRow ? undefined : row - 1;
		},
	};
}
