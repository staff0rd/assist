import { type RefObject, useEffect, useRef, useState } from "react";

export function useIdentityLayout(
	rowRef: RefObject<HTMLElement | null>,
	budget: number | null,
): { width: number; collapsed: boolean } {
	const [width, setWidth] = useState(0);
	const [collapsed, setCollapsed] = useState(false);
	const expandedWidth = useRef(0);

	useEffect(() => {
		const row = rowRef.current;
		if (!row || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() => setWidth(row.scrollWidth));
		observer.observe(row);
		return () => observer.disconnect();
	}, [rowRef]);

	useEffect(() => {
		if (!collapsed) expandedWidth.current = width;
		if (budget !== null && expandedWidth.current > 0)
			setCollapsed(expandedWidth.current > budget);
	}, [collapsed, width, budget]);

	return { width, collapsed };
}
