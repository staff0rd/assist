const EVENT = "assist:high-level-slice-select";

export type HighLevelSliceTarget = { number: number; tests: boolean };

export function selectHighLevelSlice(number: number, tests = false): void {
	globalThis.dispatchEvent(
		new CustomEvent<HighLevelSliceTarget>(EVENT, {
			detail: { number, tests },
		}),
	);
}

export function onSelectHighLevelSlice(
	listener: (target: HighLevelSliceTarget) => void,
): () => void {
	const handle = (event: Event) =>
		listener((event as CustomEvent<HighLevelSliceTarget>).detail);
	globalThis.addEventListener(EVENT, handle);
	return () => globalThis.removeEventListener(EVENT, handle);
}
