import type { ConfigArrayItemOwner } from "../../../../../../../../../config/configArrayItemOwners";
import type { ConfigArrayItemPlacement } from "../placeConfigArrayItem";
import type { ConfigArrayDraft } from "../useConfigArrayDraft";

export function configArrayDraftPlacement(
	draft: ConfigArrayDraft,
	owner: ConfigArrayItemOwner | undefined,
): ConfigArrayItemPlacement {
	if (owner?.scope !== draft.scope) return undefined;
	return draft.insertAfter === undefined
		? { kind: "replace", index: owner.indexInScope }
		: { kind: "insert", index: owner.indexInScope + 1 };
}
