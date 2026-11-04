const EVENT = "assist:high-level-slice-select";

export function selectHighLevelSlice(number: number): void {
	globalThis.dispatchEvent(new CustomEvent<number>(EVENT, { detail: number }));
}

export function onSelectHighLevelSlice(
	listener: (number: number) => void,
): () => void {
	const handle = (event: Event) =>
		listener((event as CustomEvent<number>).detail);
	globalThis.addEventListener(EVENT, handle);
	return () => globalThis.removeEventListener(EVENT, handle);
}
