import { useEffect, useState } from "react";

/** Current epoch seconds, re-rendered on the given interval to drive countdowns. */
export function useNowSeconds(intervalMs: number): number {
	const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
	useEffect(() => {
		const id = setInterval(
			() => setNow(Math.floor(Date.now() / 1000)),
			intervalMs,
		);
		return () => clearInterval(id);
	}, [intervalMs]);
	return now;
}
