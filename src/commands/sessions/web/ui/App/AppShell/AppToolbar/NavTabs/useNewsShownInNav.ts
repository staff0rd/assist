import { useEffect, useState } from "react";
import { apiFetch } from "../../../../apiFetch";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";

export function useNewsShownInNav(): boolean {
	const [showInNav, setShowInNav] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await apiFetch("/api/news/nav");
				const body = await res.json();
				if (!cancelled) setShowInNav(body?.showInNav === true);
			} catch (error) {
				reportCaughtError(error, "news nav");
				if (!cancelled) setShowInNav(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return showInNav;
}
