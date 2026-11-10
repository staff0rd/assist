import type { HunkData } from "react-diff-view";

export type ForBase<T> = { base: HunkData[]; value: T };

export function forBase<T>(
	state: ForBase<T> | null,
	base: HunkData[],
): T | undefined {
	return state?.base === base ? state.value : undefined;
}
