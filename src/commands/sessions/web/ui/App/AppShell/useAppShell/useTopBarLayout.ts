import { useEffect, useState } from "react";

export function useTopBarLayout(): boolean {
	const [topBar, setTopBar] = useState(true);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/session-layout");
				const body = await res.json();
				if (!cancelled) setTopBar(Boolean(body?.topBar));
			} catch {
				setTopBar(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return topBar;
}
