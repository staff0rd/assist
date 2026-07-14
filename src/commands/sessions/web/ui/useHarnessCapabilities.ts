import { useEffect, useState } from "react";

export function useHarnessCapabilities(): { exposeCodexActions: boolean } {
	const [exposeCodexActions, setExposeCodexActions] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/harness");
				const body = await res.json();
				if (!cancelled) {
					setExposeCodexActions(Boolean(body?.exposeCodexActions));
				}
			} catch {
				setExposeCodexActions(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return { exposeCodexActions };
}
