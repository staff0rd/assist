import { useRef, useState } from "react";

export function useSwipeOffset() {
	const [offset, setOffset] = useState(0);
	const [dragging, setDragging] = useState(false);
	const swallowClick = useRef(false);

	const consumeClick = () => {
		const swallow = swallowClick.current || offset !== 0;
		swallowClick.current = false;
		if (offset !== 0) setOffset(0);
		return swallow;
	};

	return {
		offset,
		setOffset,
		dragging,
		setDragging,
		swallowClick,
		consumeClick,
		close: () => setOffset(0),
	};
}
