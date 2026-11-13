import { useState } from "react";

export function useSlashListNav(key: string, count: number) {
	const [nav, setNav] = useState({ key: "", index: 0 });
	const [dismissedKey, setDismissedKey] = useState<string | null>(null);
	const highlight = nav.key === key ? Math.min(nav.index, count - 1) : 0;
	return {
		highlight,
		dismissed: key === dismissedKey,
		move: (step: number) =>
			setNav({ key, index: (highlight + step + count) % count }),
		dismiss: () => setDismissedKey(key),
	};
}
