import { useEffect, useState } from "react";

export function useLayoutFlip(stacked: boolean): boolean {
	const [settled, setSettled] = useState(stacked);
	const flipping = settled !== stacked;

	useEffect(() => {
		if (!flipping) return;
		let inner = 0;
		// why: two frames so the browser paints the flipped layout with transitions off before they're restored
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => setSettled(stacked));
		});
		return () => {
			cancelAnimationFrame(outer);
			cancelAnimationFrame(inner);
		};
	}, [flipping, stacked]);

	return flipping;
}
