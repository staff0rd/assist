import { useEffect, useState } from "react";

type Anchor = { seconds: number; at: number };

export function useTickingSeconds(
	seconds: number | undefined,
): number | undefined {
	const [anchor, setAnchor] = useState<Anchor>();
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		if (seconds === undefined) return;
		const at = Date.now();
		setAnchor({ seconds, at });
		setNow(at);
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, [seconds]);
	if (seconds === undefined) return undefined;
	if (anchor?.seconds !== seconds) return seconds;
	return seconds + Math.max(0, Math.floor((now - anchor.at) / 1000));
}
