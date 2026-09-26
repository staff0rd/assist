import { useEffect, useState } from "react";

export function useNewsShownInNav(): boolean {
	const [showInNav, setShowInNav] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/news/nav");
				const body = await res.json();
				if (!cancelled) setShowInNav(body?.showInNav === true);
			} catch {
				if (!cancelled) setShowInNav(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return showInNav;
}
