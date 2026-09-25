import { useEffect, useState } from "react";

export function useWaitingClock(enabled: boolean): number {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!enabled) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [enabled]);

	return now;
}
