import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { checkedRadio } from "./checkedRadio";

export function useOffsetUnderChecked(
	groupRef: RefObject<HTMLElement | null>,
	checked: string,
) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [offset, setOffset] = useState(0);

	useLayoutEffect(() => {
		const radio = checkedRadio(groupRef.current);
		const container = containerRef.current;
		if (!radio || !container) return;
		setOffset(
			radio.getBoundingClientRect().left -
				container.getBoundingClientRect().left,
		);
	}, [groupRef, checked]);

	return { containerRef, offset };
}
