import { useEffect, useState } from "react";
import { sessionViewDefaults } from "../../../../../../../../shared/sessionViewDefaults";

export function useSessionViewConfig(): {
	floatWaiting: boolean;
	floatWaitingAfterMs: number;
} {
	const [floatWaiting, setFloatWaiting] = useState(
		sessionViewDefaults.floatWaiting,
	);
	const [floatWaitingAfterMs, setFloatWaitingAfterMs] = useState(
		sessionViewDefaults.floatWaitingAfterMs,
	);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/session-view");
				const body = await res.json();
				if (cancelled) return;
				setFloatWaiting(Boolean(body?.floatWaiting));
				setFloatWaitingAfterMs(
					typeof body?.floatWaitingAfterMs === "number"
						? body.floatWaitingAfterMs
						: sessionViewDefaults.floatWaitingAfterMs,
				);
			} catch {
				setFloatWaiting(sessionViewDefaults.floatWaiting);
				setFloatWaitingAfterMs(sessionViewDefaults.floatWaitingAfterMs);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return { floatWaiting, floatWaitingAfterMs };
}
