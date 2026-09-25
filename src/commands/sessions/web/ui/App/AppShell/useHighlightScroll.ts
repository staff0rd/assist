import { useEffect, useRef } from "react";

export function useHighlightScroll(highlighted: boolean) {
	const ref = useRef<HTMLLIElement>(null);

	useEffect(() => {
		if (highlighted) ref.current?.scrollIntoView({ block: "nearest" });
	}, [highlighted]);

	return ref;
}
