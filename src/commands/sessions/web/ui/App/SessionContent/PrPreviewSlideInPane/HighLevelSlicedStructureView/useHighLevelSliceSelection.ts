import { useEffect, useMemo, useState } from "react";
import { highLevelSliceDomId } from "../highLevelSliceDomId";
import {
	type HighLevelSliceTarget,
	onSelectHighLevelSlice,
} from "../selectHighLevelSlice";

function scrollToTarget({ number, tests }: HighLevelSliceTarget): void {
	const reduceMotion = globalThis.matchMedia?.(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const id = `${highLevelSliceDomId(number)}${tests ? "-tests" : ""}`;
	const scroll = () =>
		document.getElementById(id)?.scrollIntoView?.({
			block: "start",
			behavior: reduceMotion ? "auto" : "smooth",
		});
	if (typeof requestAnimationFrame === "undefined") scroll();
	else requestAnimationFrame(scroll);
}

export function useHighLevelSliceSelection(count: number) {
	const [selected, setSelected] = useState<number | null>(null);
	const [pending, setPending] = useState<HighLevelSliceTarget | null>(null);

	useEffect(
		() =>
			onSelectHighLevelSlice((target) => {
				setSelected(target.number);
				setPending(target);
			}),
		[],
	);
	useEffect(() => {
		if (!pending) return;
		scrollToTarget(pending);
		setPending(null);
	}, [pending]);

	const current = selected !== null && selected <= count ? selected : null;
	const inView = useMemo(
		() =>
			new Set(
				current === null
					? Array.from({ length: count }, (_, index) => index + 1)
					: [current],
			),
		[current, count],
	);
	return {
		selected: current,
		inView,
		onSelect: (number: number | null) => {
			setSelected(number);
			if (number !== null) setPending({ number, tests: false });
		},
	};
}
