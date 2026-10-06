import type { configArrayRowState } from "./configArrayRowState";
import type { useConfigArrayDraft } from "./useConfigArrayDraft";
import type { useConfigArrayItemWrites } from "./useConfigArrayItemWrites";
import { configArrayDraftPlacement } from "./configArrayItemOperations/configArrayDraftPlacement";

type Options = {
	state: ReturnType<typeof configArrayRowState>;
	draft: ReturnType<typeof useConfigArrayDraft>;
	writes: ReturnType<typeof useConfigArrayItemWrites>;
};

export function configArrayItemOperations({ state, draft, writes }: Options) {
	async function save(): Promise<void> {
		const open = draft.current;
		if (!open) return;
		const written = await writes.saveItem(
			open.scope,
			state.layerOf(open.scope),
			configArrayDraftPlacement(
				open,
				state.ownerOf(open.insertAfter ?? open.index),
			),
			open.value,
		);
		if (written) draft.close();
	}

	async function move(index: number, delta: number): Promise<void> {
		const owner = state.ownerOf(index);
		if (!owner || !state.canMove(index, delta)) return;
		draft.close();
		await writes.moveItem(
			owner.scope,
			state.layerOf(owner.scope),
			owner.indexInScope,
			owner.indexInScope + delta,
		);
	}

	async function remove(index: number): Promise<void> {
		const owner = state.ownerOf(index);
		if (!owner) return;
		draft.close();
		await writes.removeItem(
			owner.scope,
			state.layerOf(owner.scope),
			owner.indexInScope,
		);
	}

	return { save, move, remove };
}
