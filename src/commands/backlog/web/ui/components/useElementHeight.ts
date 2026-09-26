import { type RefObject, useEffect, useState } from "react";

export function useElementHeight(
	ref: RefObject<HTMLElement | null>,
	fallback: number,
): number {
	const [height, setHeight] = useState(fallback);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		setHeight(element.offsetHeight);
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);

	return height;
}
