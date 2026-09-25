import type { ConfigEntry } from "../../../../../../../../../../../config/readConfigEntries";
import { configArrayItemOperations } from "./useConfigArrayRowEditor/configArrayItemOperations";
import { configArrayItems } from "./useConfigArrayRowEditor/configArrayItems";
import { configArrayRowState } from "./useConfigArrayRowEditor/configArrayRowState";
import { defaultConfigScope } from "../defaultConfigScope";
import { useConfigArrayDraft } from "./useConfigArrayRowEditor/useConfigArrayDraft";
import { useConfigArrayItemWrites } from "./useConfigArrayRowEditor/useConfigArrayItemWrites";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function useConfigArrayRowEditor({
	entry,
	cwd,
	onSaved,
	onError,
}: Options) {
	const items = configArrayItems(entry);
	const draft = useConfigArrayDraft();
	const writes = useConfigArrayItemWrites({ entry, cwd, onSaved, onError });
	const state = configArrayRowState(entry, items, draft.current);

	return {
		...state,
		...configArrayItemOperations({ state, draft, writes }),
		items,
		saving: writes.saving,
		toggle: (index: number) =>
			state.isOpen(index)
				? draft.close()
				: draft.openAt(
						index,
						items[index]?.value ?? {},
						state.scopeToWrite(index),
					),
		add: () => draft.openAt(items.length, {}, defaultConfigScope(entry)),
		setValue: draft.setValue,
		setScope: draft.setScope,
		cancel: draft.close,
	};
}
