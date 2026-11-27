import { useRef } from "react";

export function usePendingSendCount(pending: string[] | undefined): number {
	const previous = useRef(pending?.length ?? 0);
	const count = useRef(0);
	const length = pending?.length ?? 0;
	if (length > previous.current) count.current++;
	previous.current = length;
	return count.current;
}
