import { useEffect, useRef } from "react";

export function useLastActiveId(activeId: string | null): {
	readonly current: string | null;
} {
	const last = useRef(activeId);
	useEffect(() => {
		if (activeId) last.current = activeId;
	}, [activeId]);
	return last;
}
