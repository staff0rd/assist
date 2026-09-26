import { type RefObject, useEffect, useState } from "react";
import { balancedWrapWidth } from "./useBalancedWrapWidth/balancedWrapWidth";

type Measure = { widths: number[]; gap: number };

function sameMeasure(a: Measure, b: Measure): boolean {
	return (
		a.gap === b.gap &&
		a.widths.length === b.widths.length &&
		a.widths.every((width, i) => width === b.widths[i])
	);
}

function outerWidth(item: Element): number {
	const style = getComputedStyle(item);
	return (
		item.getBoundingClientRect().width +
		(Number.parseFloat(style.marginLeft) || 0) +
		(Number.parseFloat(style.marginRight) || 0)
	);
}

function flexItems(box: Element): Element[] {
	return Array.from(box.children).flatMap((child) =>
		getComputedStyle(child).display === "contents" ? flexItems(child) : [child],
	);
}

export function useBalancedWrapWidth(
	ref: RefObject<HTMLElement | null>,
	available: number | null,
): number | undefined {
	const [measure, setMeasure] = useState<Measure>({ widths: [], gap: 0 });

	useEffect(() => {
		const box = ref.current;
		if (!box || typeof ResizeObserver === "undefined") return;
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
	}, [ref]);

	if (available === null) return undefined;
	return balancedWrapWidth(measure.widths, measure.gap, available);
}
