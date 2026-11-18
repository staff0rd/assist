import { type RefObject, useEffect, useState } from "react";
import { balancedWrapWidth } from "./useBalancedWrapWidth/balancedWrapWidth";
import { flexItems } from "./useBalancedWrapWidth/flexItems";
import { outerWidth } from "./useBalancedWrapWidth/outerWidth";

type Measure = { widths: number[]; gap: number };

function sameMeasure(a: Measure, b: Measure): boolean {
	return (
		a.gap === b.gap &&
		a.widths.length === b.widths.length &&
		a.widths.every((width, i) => width === b.widths[i])
	);
}

export function useBalancedWrapWidth(
	ref: RefObject<HTMLElement | null>,
	available: number | null,
): number | undefined {
	const [measure, setMeasure] = useState<Measure>({ widths: [], gap: 0 });

	const balancing = available !== null;

	useEffect(() => {
		const box = ref.current;
		if (!balancing || !box || typeof ResizeObserver === "undefined") return;
		const read = () => {
			const next = {
				widths: flexItems(box).map(outerWidth),
				gap: Number.parseFloat(getComputedStyle(box).columnGap) || 0,
			};
			setMeasure((prev) => (sameMeasure(prev, next) ? prev : next));
		};
		const resize = new ResizeObserver(read);
		const observeChildren = () => {
			resize.disconnect();
			for (const item of flexItems(box)) resize.observe(item);
			read();
		};
		const mutation = new MutationObserver(observeChildren);
		mutation.observe(box, { childList: true, subtree: true });
		observeChildren();
		return () => {
			resize.disconnect();
			mutation.disconnect();
		};
	}, [ref, balancing]);

	if (available === null) return undefined;
	return balancedWrapWidth(measure.widths, measure.gap, available);
}
