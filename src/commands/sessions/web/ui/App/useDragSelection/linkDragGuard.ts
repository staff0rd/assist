export type LinkDragGuard = { release: (swallowClick: boolean) => void };

export function linkDragGuard(
	target: EventTarget | null,
): LinkDragGuard | null {
	if (!(target instanceof Element) || !target.closest("a[href]")) return null;

	const preventDefault = (ev: Event) => ev.preventDefault();
	const onClick = (ev: globalThis.MouseEvent) => {
		globalThis.removeEventListener("click", onClick, true);
		ev.preventDefault();
		ev.stopPropagation();
	};
	globalThis.addEventListener("dragstart", preventDefault);
	globalThis.addEventListener("click", onClick, true);

	return {
		release: (swallowClick) => {
			globalThis.removeEventListener("dragstart", preventDefault);
			const stop = () => globalThis.removeEventListener("click", onClick, true);
			if (swallowClick) setTimeout(stop, 0);
			else stop();
		},
	};
}
